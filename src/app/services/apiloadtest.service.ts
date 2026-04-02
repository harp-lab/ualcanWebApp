import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout, firstValueFrom } from 'rxjs';
import { ICancer } from '../cancer.interface';

export interface ApiLoadTestResult {
  callNumber: number;
  analysis: string;
  gene: string;
  cancer: string;
  success: boolean;
  elapsed: number;
  error?: string;
}

export interface ApiLoadTestResponse {
  results: ApiLoadTestResult[];
  csv: string;
  totalElapsed: number;
  averageMs: number;
  minTime: number;
  maxTime: number;
  minCall?: ApiLoadTestResult;
  maxCall?: ApiLoadTestResult;
}

@Injectable({
  providedIn: 'root'
})
export class ApiLoadTestService {
  private readonly genes = ['TP53', 'EGFR', 'BRCA1', 'BRCA2', 'MYC', 'PTEN'];

  constructor(private http: HttpClient) {}

  async runTest(options: {
    totalCalls: number;
    analyses: string[];
    expressionCancers: ICancer[];
    methylationCancers: ICancer[];
    proteomicCancers: ICancer[];
    timeoutMs?: number;
    onProgress?: (completed: number, total: number) => void;
  }): Promise<ApiLoadTestResponse> {
    const totalCalls = options.totalCalls;
    const timeoutMs = options.timeoutMs ?? 20000;

    const startAll = performance.now();
    const results: ApiLoadTestResult[] = [];
    let completed = 0;

    const promises = Array.from({ length: totalCalls }, async (_, i) => {
      const callNumber = i + 1;

      const analysis = this.getRandom(options.analyses);
      const gene = this.getRandom(this.genes);
      const cancer = this.getRandomCancer(
        analysis,
        options.expressionCancers,
        options.methylationCancers,
        options.proteomicCancers
      );

      const url = this.buildUrl(analysis, gene, cancer);
      const start = performance.now();

      try {
        await firstValueFrom(
          this.http.get(url).pipe(timeout(timeoutMs))
        );

        const elapsed = Math.round(performance.now() - start);

        results.push({
          callNumber,
          analysis,
          gene,
          cancer,
          success: true,
          elapsed
        });
      } catch (err: any) {
        const elapsed = Math.round(performance.now() - start);

        results.push({
          callNumber,
          analysis,
          gene,
          cancer,
          success: false,
          elapsed,
          error: err?.message || 'error'
        });
      }

      completed++;
      options.onProgress?.(completed, totalCalls);
    });

    await Promise.all(promises);

    const totalElapsed = Math.round(performance.now() - startAll);

    const times = results.map(r => r.elapsed);

    const averageMs = Math.round(
      times.reduce((sum, t) => sum + t, 0) / times.length
    );

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const minCall = results.find(r => r.elapsed === minTime);
    const maxCall = results.find(r => r.elapsed === maxTime);

    const csv = this.buildCsv(
      results,
      totalElapsed,
      averageMs,
      minTime,
      maxTime,
      minCall,
      maxCall
    );

    return {
      results,
      csv,
      totalElapsed,
      averageMs,
      minTime,
      maxTime,
      minCall,
      maxCall
    };
  }

  private getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private buildUrl(analysis: string, gene: string, cancer: string): string {
    let api = '';

    switch (analysis) {
      case 'expression':
        api = 'ualcan-gene-json.pl';
        break;
      case 'methylation':
        api = 'ualcan-methyl-json.pl';
        break;
      case 'proteomics':
        api = 'ualcan-CPTAC-json.pl';
        break;
      default:
        api = 'ualcan-gene-json.pl';
        break;
    }

    return `https://ualcan.path.uab.edu/cgi-bin/${api}?genenam=${gene}&ctype=${cancer}`;
  }

  private getRandomCancer(
    analysis: string,
    expressionCancers: ICancer[],
    methylationCancers: ICancer[],
    proteomicCancers: ICancer[]
  ): string {
    if (analysis === 'proteomics') {
      return this.getRandom(proteomicCancers).id;
    }

    if (analysis === 'methylation') {
      return this.getRandom(methylationCancers).id;
    }

    return this.getRandom(expressionCancers).id;
  }

  private buildCsv(
    results: ApiLoadTestResult[],
    totalElapsed: number,
    averageMs: number,
    minTime: number,
    maxTime: number,
    minCall?: ApiLoadTestResult,
    maxCall?: ApiLoadTestResult
  ): string {
    let csv = 'CallNumber,Analysis,Cancer,Gene,Success,ElapsedMs,Error\n';

    results
      .slice()
      .sort((a, b) => a.callNumber - b.callNumber)
      .forEach(r => {
        csv += [
          r.callNumber,
          r.analysis,
          r.cancer,
          r.gene,
          r.success,
          r.elapsed,
          r.error ? `"${String(r.error).replace(/"/g, '""')}"` : ''
        ].join(',') + '\n';
      });

    csv += '\n';
    csv += 'SUMMARY,,,,,,\n';
    csv += `Total Calls,${results.length}\n`;
    csv += `Average (ms),${averageMs}\n`;
    csv += `Min (ms),${minTime},Call ${minCall?.callNumber}\n`;
    csv += `Max (ms),${maxTime},Call ${maxCall?.callNumber}\n`;
    csv += `Total Time (ms),${totalElapsed}\n`;

    return csv;
  }
}
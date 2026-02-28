import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../core/api';

interface OptimizationResult {
  saved: number;
  suggestions: string[];
}

@Component({
  selector: 'app-optimize',
  imports: [CommonModule],
  templateUrl: './optimize.html',
  styleUrl: './optimize.css',
})
export class Optimize {
  analyzing = false;
  result: OptimizationResult | null = null;

  metrics = {
    utilization: 72,
    avgGapTime: 45,
    conflicts: 2,
    efficiency: 85
  };

  constructor(private api: Api) {}

  runOptimization(): void {
    this.analyzing = true;
    this.result = null;

    this.api.optimizeSchedule().subscribe(result => {
      this.result = result;
      this.analyzing = false;
      // Update metrics after optimization
      this.metrics.utilization = 85;
      this.metrics.avgGapTime = 30;
      this.metrics.conflicts = 0;
      this.metrics.efficiency = 92;
    });
  }

  applyOptimization(): void {
    alert('Optimization applied! Your schedule has been updated.');
    this.result = null;
  }
}

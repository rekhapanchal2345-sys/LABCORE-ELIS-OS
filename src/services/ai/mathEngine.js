/**
 * LabCore ELIS - Scientific & Statistical Machine Learning Math Engine
 * Provides NumPy/SciPy-equivalent numerical operations, matrix transformations,
 * probability distributions, activation functions, and Westgard clinical QC rules.
 */

class MathEngine {
  // Vector & Array Operations
  static mean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + Number(val), 0) / arr.length;
  }

  static variance(arr, isSample = true) {
    if (!arr || arr.length < 2) return 0;
    const avg = this.mean(arr);
    const sumSq = arr.reduce((sum, val) => sum + Math.pow(Number(val) - avg, 2), 0);
    return sumSq / (isSample ? arr.length - 1 : arr.length);
  }

  static stdDev(arr, isSample = true) {
    return Math.sqrt(this.variance(arr, isSample));
  }

  static median(arr) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static quantile(arr, q) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }

  static zScores(arr) {
    const avg = this.mean(arr);
    const sd = this.stdDev(arr);
    if (sd === 0) return arr.map(() => 0);
    return arr.map(x => (x - avg) / sd);
  }

  static pearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;
    const xMean = this.mean(x);
    const yMean = this.mean(y);
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - xMean;
      const dy = y[i] - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : num / den;
  }

  // Normal Distribution CDF for p-value estimation
  static normalCDF(x, mean = 0, std = 1) {
    const z = (x - mean) / std;
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) prob = 1.0 - prob;
    return prob;
  }

  // Linear Algebra: Matrix Operations
  static dot(vecA, vecB) {
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      sum += vecA[i] * vecB[i];
    }
    return sum;
  }

  static matrixMultiply(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;
    if (colsA !== rowsB) throw new Error(`Matrix dimensions mismatch: [${rowsA}x${colsA}] vs [${rowsB}x${colsB}]`);
    
    const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  static transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  // Activation & Loss Functions
  static sigmoid(z) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
  }

  static sigmoidDerivative(p) {
    return p * (1 - p);
  }

  static softmax(arr) {
    const maxVal = Math.max(...arr);
    const expArr = arr.map(x => Math.exp(x - maxVal));
    const sumExp = expArr.reduce((a, b) => a + b, 0);
    return expArr.map(x => x / (sumExp || 1));
  }

  static relu(x) {
    return Math.max(0, x);
  }

  static reluDerivative(x) {
    return x > 0 ? 1 : 0;
  }

  static leakyRelu(x, alpha = 0.01) {
    return x > 0 ? x : alpha * x;
  }

  static leakyReluDerivative(x, alpha = 0.01) {
    return x > 0 ? 1 : alpha;
  }

  // Preprocessing / Scalers
  static standardScale(matrix) {
    const cols = matrix[0].length;
    const means = [];
    const stds = [];
    
    for (let c = 0; c < cols; c++) {
      const colVals = matrix.map(row => row[c]);
      const m = this.mean(colVals);
      const s = this.stdDev(colVals) || 1e-7;
      means.push(m);
      stds.push(s);
    }

    const scaled = matrix.map(row =>
      row.map((val, c) => (val - means[c]) / stds[c])
    );

    return { scaled, means, stds };
  }

  static minMaxScale(matrix) {
    const cols = matrix[0].length;
    const mins = [];
    const maxs = [];

    for (let c = 0; c < cols; c++) {
      const colVals = matrix.map(row => row[c]);
      mins.push(Math.min(...colVals));
      maxs.push(Math.max(...colVals));
    }

    const scaled = matrix.map(row =>
      row.map((val, c) => {
        const diff = maxs[c] - mins[c];
        return diff === 0 ? 0.5 : (val - mins[c]) / diff;
      })
    );

    return { scaled, mins, maxs };
  }

  // Clinical Quality Control: Westgard Multi-Rule Evaluation
  static evaluateWestgardQC(controlRuns, targetMean, targetSD) {
    const violations = [];
    const n = controlRuns.length;
    if (n === 0) return { pass: true, violations: [] };

    const lastVal = controlRuns[n - 1];
    const lastZ = (lastVal - targetMean) / targetSD;

    // 1. 1:3s Rule (Random error alert: 1 control observation exceeds Mean ± 3SD)
    if (Math.abs(lastZ) > 3.0) {
      violations.push({
        rule: '1:3s',
        severity: 'CRITICAL',
        type: 'Random Error',
        description: `Run observation (${lastVal}) exceeded ±3 SD (Z-score: ${lastZ.toFixed(2)}). Immediate run rejection.`,
        action: 'Reject run. Check reagent lot, calibrator stability, and optical path.'
      });
    }

    // 2. 2:2s Rule (Systematic error: 2 consecutive runs exceed +2SD or -2SD)
    if (n >= 2) {
      const prevZ = (controlRuns[n - 2] - targetMean) / targetSD;
      if ((lastZ > 2.0 && prevZ > 2.0) || (lastZ < -2.0 && prevZ < -2.0)) {
        violations.push({
          rule: '2:2s',
          severity: 'HIGH',
          type: 'Systematic Error',
          description: `2 consecutive runs exceeded 2 SD on the same side of mean (${prevZ.toFixed(2)}, ${lastZ.toFixed(2)}).`,
          action: 'Recalibrate analyzer and rerun controls.'
        });
      }
    }

    // 3. R:4s Rule (Random error: 1 run exceeds +2SD and another exceeds -2SD within same batch)
    if (n >= 2) {
      const prevZ = (controlRuns[n - 2] - targetMean) / targetSD;
      if (Math.abs(lastZ - prevZ) >= 4.0) {
        violations.push({
          rule: 'R:4s',
          severity: 'HIGH',
          type: 'Random Error',
          description: `Range difference between consecutive runs exceeded 4 SD (${Math.abs(lastZ - prevZ).toFixed(2)} SD).`,
          action: 'Inspect sample probe, bubble formation, or electrical noise.'
        });
      }
    }

    // 4. 4:1s Rule (Systematic shift: 4 consecutive runs exceed +1SD or -1SD)
    if (n >= 4) {
      const last4 = controlRuns.slice(n - 4).map(v => (v - targetMean) / targetSD);
      if (last4.every(z => z > 1.0) || last4.every(z => z < -1.0)) {
        violations.push({
          rule: '4:1s',
          severity: 'MEDIUM',
          type: 'Systematic Trend',
          description: `4 consecutive control measurements on one side of 1 SD. Calibration drift detected.`,
          action: 'Perform routine maintenance and verify reagent expiration.'
        });
      }
    }

    // 5. 10:x Rule (Systematic shift: 10 consecutive runs on one side of mean)
    if (n >= 10) {
      const last10 = controlRuns.slice(n - 10).map(v => (v - targetMean) / targetSD);
      if (last10.every(z => z > 0) || last10.every(z => z < 0)) {
        violations.push({
          rule: '10:x',
          severity: 'MEDIUM',
          type: 'Systematic Bias',
          description: `10 consecutive runs fell on one side of target mean (${targetMean}).`,
          action: 'Check instrument baseline zeroing and photometer offset.'
        });
      }
    }

    return {
      pass: violations.length === 0,
      currentZScore: Number(lastZ.toFixed(2)),
      targetMean,
      targetSD,
      violations
    };
  }
}

module.exports = MathEngine;

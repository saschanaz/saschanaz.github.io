///<reference path="submodules/matrixcsv/submodules/snmath/lib/snmath.d.ts" />
///<reference path="submodules/matrixcsv/lib/matrixcsv.d.ts" />

declare function saveAs(data: Blob, fileName: string, disableAutoBOM?: boolean): void;

declare var loader: HTMLInputElement;
document.addEventListener("DOMContentLoaded", () => {
  loader.addEventListener("change", async () => {
    const data = await MatrixCSV.readFile(loader.files[0]);
    const [responses, delays, averageDelay] = getDelays(data);
    const resultMatrix = createResultMatrix(responses, delays, averageDelay);
    const csv = MatrixCSV.encode(resultMatrix);
    
    saveAs(new Blob([csv], "text/csv"), `${loader.files[0].name.split('.')[0]}-result.csv`);
  })
});

function createResultMatrix(responses: number[], delays: number[], averageDelay: number) {
  const result = new SNMath.Matrix<string | number>([responses.length, 3]);

  result.set([4, 1], "First Response Time<30");
  result.set([4, 2], "Delay")
  result.set([4, 3], "Average Delay")
  result.set([5, 3], averageDelay);

  for (let i = 0; i < responses.length; i++) {
    result.set([i + 5, 1], responses[i]);
    result.set([i + 5, 2], delays[i]);
  }
  return result;
}

function getDelays(matrix: SNMath.Matrix<string>): [number[], number[], number] {
  matrix = matrix.transpose();
  let stimulationTimes = matrix.submatrix([3, 5], [3, undefined]).serialize().map(i => +i / 10);
  let responseTimes = matrix.submatrix([4, 5], [4, undefined]).serialize().map(i => +i / 10);

  const firstResponseTimes: number[] = [];
  const firstResponseDelays: number[] = [];
  let lastIndex = -1;
  for (const stimulationTime of stimulationTimes) {
    // find the first response time larger than stimulationTime
    for (let i = lastIndex + 1; i < responseTimes.length; i++) {
      const responseTime = responseTimes[i];
      if (responseTime > stimulationTime) {
        if (responseTime < stimulationTime + 30) {
          firstResponseTimes.push(responseTime);
          firstResponseDelays.push(responseTime - stimulationTime);
        }
        else {
          firstResponseTimes.push(NaN);
          firstResponseDelays.push(NaN);
        }
        lastIndex = i;
        break;
      }
    }
  }

  return [firstResponseTimes, firstResponseDelays, average(firstResponseDelays)];
}

function average(numbers: number[]) {
  let sum = 0;
  let count = 0;
  for (const n of numbers) {
    if (!Number.isNaN(n)) {
      sum += n;
      count++;
    }
  }
  return sum / count;
}
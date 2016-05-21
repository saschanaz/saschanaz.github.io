///<reference path="submodules/matrixcsv/submodules/snmath/lib/snmath.d.ts" />
///<reference path="submodules/matrixcsv/lib/matrixcsv.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
document.addEventListener("DOMContentLoaded", () => {
    loader.addEventListener("change", () => __awaiter(this, void 0, Promise, function* () {
        const data = yield MatrixCSV.readFile(loader.files[0]);
        const [responses, delays, averageDelay] = getDelays(data);
        const resultMatrix = createResultMatrix(responses, delays, averageDelay);
        const csv = MatrixCSV.encode(resultMatrix);
        saveAs(new Blob([csv], "text/csv"), `${loader.files[0].name.split('.')[0]}-result.csv`);
    }));
});
function createResultMatrix(responses, delays, averageDelay) {
    const result = new SNMath.Matrix([responses.length, 3]);
    result.set([4, 1], "First Response Time<30");
    result.set([4, 2], "Delay");
    result.set([4, 3], "Average Delay");
    result.set([5, 3], averageDelay);
    for (let i = 0; i < responses.length; i++) {
        result.set([i + 5, 1], responses[i]);
        result.set([i + 5, 2], delays[i]);
    }
    return result;
}
function getDelays(matrix) {
    matrix = matrix.transpose();
    let stimulationTimes = matrix.submatrix([3, 5], [3, undefined]).serialize().map(i => +i / 10);
    let responseTimes = matrix.submatrix([4, 5], [4, undefined]).serialize().map(i => +i / 10);
    const firstResponseTimes = [];
    const firstResponseDelays = [];
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
function average(numbers) {
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
//# sourceMappingURL=app.js.map
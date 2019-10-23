const exec = require('child_process').exec;
const fs = require('fs');
const apiUrl = 'http://<api-url>:<port>';

const duration = '3s'; // Tiempo de duración de cada request de medición
const threads = 12; // Cantidad de hilos utilizados por Wrk
const iterations = 1500; // Cantidad de iteraciones de la medición
const initialIter = 1; // Punto de inicio de la medición

/**
 * Se encarga de escribir resultados en un archivo de texto
 * @param {string} result resultado a registrar
 *
 */
function writeResult(result) {
  fs.appendFile('result.txt', result, err => {
    if (err) console.log(err);
  });
}

/**
 * Ejecuta un comando enviado por parámetro
 * @param {string} cmd comando a ejecutar
 */
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      try {
        let map = stdout.split(':');
        let tps = map[1];
        resolve(tps.trim());
      } catch (error) {
        console.log(error);
        resolve(0);
      }
    });
  });
}

/**
 * Función principal para la ejecución del benchmark. Tiene actualmente un salto de 7
 * para la ejecución de cada medición.
 */
async function startBenchmark() {
  for (let conn = initialIter; conn <= iterations; conn += 7) {
    let realThreads = conn < threads ? conn : threads;

    let cmd = `wrk -t${realThreads} -c${conn} -d${duration} ${apiUrl} | grep Requests`;
    await execShellCommand(cmd).then(value => {
      writeResult(conn + ',' + value + '\n');
      console.log(`${conn},${value}\n`);
    });
  }
}

startBenchmark();

import { spawn } from "child_process";

export const runPrediction = (type, features) => {
  return new Promise((resolve, reject) => {
    const process = spawn("python", [
      "ml/predict.py",
      type,
      JSON.stringify({ features }),
    ]);

    let output = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.on("close", () => {
      resolve(JSON.parse(output));
    });

    process.on("error", reject);
  });
};

import * as tf from "@tensorflow/tfjs-node";

let model;

async function createModel() {
  model = tf.sequential();

  model.add(
    tf.layers.dense({ units: 16, inputShape: [4], activation: "relu" })
  );
  model.add(tf.layers.dense({ units: 8, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  const xs = tf.tensor2d([
    [60, 4, 3, 1],
    [90, 8, 0, 4],
    [50, 3, 4, 0],
    [85, 7, 1, 3],
    [70, 5, 2, 2],
    [55, 2, 4, 1],
    [95, 9, 0, 5],
    [65, 4, 3, 2],
  ]);

  const ys = tf.tensor2d([[1], [0], [1], [0], [1], [1], [0], [1]]);

  await model.fit(xs, ys, { epochs: 300 });
}

await createModel();

export async function predictRisk(a, g, b, p) {
  const result = model.predict(tf.tensor2d([[a, g, b, p]]));
  return result.dataSync()[0];
}

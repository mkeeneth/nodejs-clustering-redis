// Lets cluster!
var cluster = require("cluster");

// master process
if (cluster.isMaster) {
  // CPUs
  var cpuCount = require("os").cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  // handle crashed/dead worker threads
  cluster.on("exit", function(worker) {
    console.log("Worker id: %d exited", worker.id);
    cluster.fork();
  });

  // worker processes
} else {
  const express = require("express");
  const bodyParser = require("body-parser");
  const app = express();
  const port = 8000;

  app.use(bodyParser.urlencoded({ extended: true }));

  require("./app/routes")(app, {});

  app.listen(port, () => {
    console.log(`Worker: ${cluster.worker.id} Listening on port: ${port}`);
  });
}

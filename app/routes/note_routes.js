const maxNotePerUser = 20;

module.exports = function(app) {
  app.post("/noop", (req, res) => {
    const note = { text: req.body.body, title: req.body.title };

    res.status(418);
    res.send({ noop: true, title: note.title, text: note.text }).end();
  });

  app.post("/notes", (req, res) => {
    const note = { text: req.body.body, title: req.body.title };
    var redis = require("./../../db");
    // use promises
    const { promisify } = require("util");
    const getAsync = promisify(redis.get).bind(redis);

    // the user id
    let userId = req.body.userId;

    redis.watch(`note_count:${userId}`); // tell redis to block on this key
    getAsync(`note_count:${userId}`)
      .then(count => {
        if (count >= maxNotePerUser) {
          res.status(507);
          res
            .send({
              error: true,
              message: `limit ${maxNotePerUser}!`
            })
            .end();
        } else {
          let newCount = count === null ? 1 : parseInt(count) + 1;
          // transaction
          redis
            .multi()
            .incr(`note_count:${userId}`)
            .hset(
              `note:${userId}:${newCount}`,
              "title",
              note.title,
              "body",
              note.text,
              "created",
              new Date(),
              redis.print
            )
            .exec();
          res.status(202);
          res.send({ title: note.title, text: note.text }).end();
        }
      })
      .catch(err => {
        console.error(`err: ${err}`);
      });
  });
};

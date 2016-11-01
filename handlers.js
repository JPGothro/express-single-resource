const fileStore = require('./lib/dotaTeam');
const bodyReader = require('./lib/bodyReader');
const pug = require('pug');

const handlers = {};

handlers.post = (req, res) => {
    return bodyReader(req, (err, team) => {
        if(err) {
            res.statusCode = 400;
            console.log('body-reader POST-handler err');
            res.end(err.message);
        } else {
            fileStore.createFile(team)
            .then(data => {
                console.log('filestore.createfile: ', data);
                res.writeHead(201, {
                    'Content-Type': 'application/json' 
                });
                res.write(data);
                res.end();
            })
            .catch(err => {
                console.log('POST catch error');
                res.end(err);
            });
        }
    });
};

handlers.getSingle = (req, res, id) => {
  fileStore.getFile('/' + id)
    .then(team => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.end(team);
    }).catch( () => {
      handlers.notFound(res);
    });
};

handlers.getAll = (req, res) => {
  fileStore.readDir(fileStore.path)
    .then(idArr => {
      // console.log('idArr in getAll: ', idArr);
      return fileStore.getAll(idArr);
    })
    .then(allData => {
      res.writeHead(200, {
        'Content-Type': 'application/json' 
      });
      // console.log(allData);
      // allData.forEach( (ele) => {
      //   console.log(ele);
      //   res.write(ele);
      // });
      res.write(JSON.stringify(allData));
      res.end();
    })
    .catch( (err) => {
        console.log(err);
        handlers.notFound(res);
    });
};

handlers.put = (req, res, id) => {
  return fileStore.readDir(fileStore.path)
    .then(idArr => {
      if (idArr.indexOf(id) === -1) {
        handlers.notFound(res); 
      } else {
        return bodyReader(req, (err, team) => {
          if (err) {
            console.log('body-reader replace-handler err');
            res.statusCode = 400;
            res.end(err.message);
          } else {
            fileStore.updateFile(team, id)
              .then(data => {
                res.writeHead(200, {
                  'Content-Type': 'application/json' 
                });
                res.write(data);
                res.end();
              })
              .catch(err => {
                console.log('replace catch err');
                res.end(err);
              });
          }
        });
      }
    })
    .catch(err => {
      console.log('PUT catch error');
      res.end(err);
    });
};

handlers.remove = (req, res, id) => {
  fileStore.remove(id)
    .then( () => {
      res.writeHead(200, {
        'Content-Type': 'text/plain' 
      });
      res.write(id + ' resource was deleted.');
      res.end();
    })
    .catch(() => {
      handlers.notFound(res);
    });
};

handlers.notFound = res => {
  res.statusCode = 404;
  res.end('Resource not found.');
};


// handlers.renderHtml = (req, res, id) => {
//     fileStore.getFile('/' + id)
//     .then( (team) => {
//         console.log(team);
//         let showHtml = pug.render('dotaTeamView', {
//           team_name: team.name,
//           id: team.id,
//           region: team.region,
//           member: team.teamMembers,
//           message: team.tiWinner
//         });
//         res.write(showHtml);
//         res.statusCode = 200;
//         res.end();
//   })
//   .catch(err => {
//       console.log('GET/SHOW catch error');
//       res.end(err);
//   });
// };

module.exports = handlers;
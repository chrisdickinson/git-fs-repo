var path = require('path')
  , spider = require('git-walk-refs')
  , human = require('git-parse-human')
  , tree = require('git-walk-tree')
  , repo = require('./index')
  , assert = require('assert')
  , dir

// replace this with a path to your git repo!
dir = path.resolve(__dirname, '..', '..', 'personal', 'plate', '.git')

repo(dir, function(err, git) {
  // EXAMPLE: spider all hashes!
  var hashes = git.refs().map(function(ref) {
    return ref.hash
  })

  var last = Infinity
  spider(git.find, hashes)
    .on('data', function(x) {
      var t = human(x.author()).time
      console.log(x.hash, x.band, x.author(), JSON.stringify(x.message()))
      last = t
    })

  return

  // EXAMPLE: walk the latest commit's tree!

  var hash = git.ref('HEAD').hash

  git.find(hash, function(err, commit) {
    tree(git.find, commit)
      .on('data', function(object) {
        console.log(object.stack.map(function(x) { return x.name }).join('/'))
      })
      .on('end', function() { console.log('ended')
        global.__ended = true  
      })
  })

  return

  // EXAMPLE: just walk from the head to the end along the first parent!

  var hash = git.ref('HEAD').hash

  git.find(hash, iter)

  function iter(err, commit) {
    if(err) {
      throw err
    }

    if(!commit) {
      console.log('no commit, no joy')
      return
    }

    console.log(commit.hash, ' -> ', commit.parent(), ':', (commit.message() || '').replace(/\n/g, '\\n'))
    if(commit.parent()) {
      git.find(commit.parent(), iter)
    }
  }
}) 

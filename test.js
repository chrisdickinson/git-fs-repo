var fs = require('fs')
  , path = require('path')
  , dir = path.resolve(__dirname, '.git')
  , repo = require('./index')

repo(fs, dir, function(err, repository) {

  repository.find(repository.ref('HEAD').hash, iter)
  
  return

  function iter(err, commit) {
    console.log(commit.hash)
    console.log(commit.author())
    console.log(commit.message())
    if(err) {
      throw err
    }

    if(!commit) {
      console.log('no commit, no joy')
      return
    }

    if(commit.parent()) {
      repository.find(commit.parent(), iter)
    }
  }
}) 

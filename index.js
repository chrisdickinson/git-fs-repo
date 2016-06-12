module.exports = repository

var autoregister = require('git-autoregister-odb')
  , loadrefs = require('git-load-refs')
  , loose = require('git-odb-loose')
  , pack = require('git-odb-pack')
  , to_js = require('git-to-js')
  , ls = require('ls-stream')
  , odb = require('git-odb')
  , fs = require('fs')

function repository(dir, ready) {
  var db = odb()

  autoregister(
      fs
    , dir
    , find
    , [loose, pack]
    , got_odb
  )

  function find(oid, ready) {
    return db.find(oid, ready)
  }

  function got_odb(err, backends) {
    if(err) {
      return ready(err)
    }

    for(var i = 0, len = backends.length; i < len; ++i) {
      db.add(backends[i])
    }

    var refs = []

    ls(fs, dir)
      .pipe(loadrefs(dir, fs))
      .on('data', function(ref) { refs.push(ref) })
      .on('end', function() { ready(null, new Repository(db, refs)) })
  }
}

function Repository(odb, refs) {
  var self = this
  self._odb = odb
  self._refs = refs

  self.find = function(oid, ready) {
    return self._find(oid, ready)
  }
}

var cons = Repository
  , proto = cons.prototype

proto._find = function(oid, ready) {
  this.raw(oid, function(err, data) {
    if(err) {
      return ready(err)
    }

    ready(null, data ? add(oid, to_js(data.type, data.data)) : undefined)
  })
}

proto.ref = function(name, follow) {
  var refs = this._refs

  follow = follow === undefined ? true : follow

  for(var i = 0, len = refs.length; i < len; ++i) {
    if(refs[i].name === name) {
      return follow && refs[i].symbolic ?
        this.ref(refs[i].ref, true) :
        refs[i]
    }
  }
  return null
}

proto.refs = function(follow) {
  follow = follow === undefined ? true : follow
  var out = []
    , seen
    , tmp

  for(var i = 0, len = this._refs.length; i < len; ++i) {
    out[out.length] = this.ref(this._refs[i].name, follow)
  }

  // if we're following, only give back the unique hashes
  if(follow) {
    seen = []
    tmp = []
    for(var i = 0, len = out.length; i < len; ++i) {
      if(seen.indexOf(out[i].hash) > -1) {
        continue
      }
      seen[seen.length] = out[i].hash
      tmp[tmp.length] = out[i]
    }
    out = tmp
  }

  return out
}

proto.raw = function(oid, ready) {
  oid = oidify(oid)

  this._odb.find(oid, ready)
}

function oidify(oid) {
  if(typeof oid === 'string') {
    var buf = new Buffer(20)
    buf.write(oid.slice(0, 40), 0, 20, 'hex')
    oid = buf
  }
  return oid
}

function add(hash, data) {
  data.hash = hash
  return data
}

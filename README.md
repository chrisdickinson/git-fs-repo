# git-fs-repo

filesystem-backed read-only git repository object.

ties together all of the fs-based ODB backends, and
the ref discovery mechanism.

```javascript
var load = require('git-fs-repo')

load('/path/to/repository/.git', function(err, git) {
  var head = git.ref('HEAD').hash

  git.find(head, function(err, obj) {

  }) 
})
```

## API

#### load(dir, ready(err, repo)) -> undefined

Load a git repository from dir. `ready` will be
called with the error (if any), and the repository
object.

#### repo.find(Buffer | String hash, ready(err, object))

Lookup a git object from the backends. Hash must be either
a 40-character hexadecimal string, or a 20-byte Buffer.

If no object was found, there will be no error, but also no
data.

If there was an error in any of the backends, it will be propagated
as `err`.

**NB**: `find` is tightly bound to the repository object, since so
many other `git-*` projects rely on having a `find` function provided.

So instead of doing:

```javascript
var walk = require('git-walk-tree')
  , repo = /* some repo */0;

walk(find, head_commit)

function find(oid, ready) {
  return repo.find(oid, ready)
}
```

You can do:

```javascript
var walk = require('git-walk-tree')
  , repo = /* some repo */0;

walk(repo.find, head_commit)
```

#### repo.ref(name[, follow=true]) -> Reference

Lookup a reference by name. If follow is true or not given, it will
dereference any intermediary symbolic references (i.e., refs that point
at other refs.)

#### repo.refs([follow=true]) -> [Reference, ...]

Return all references. If follow is true or not given, it will
dereference symbolic links, and the returned list will include only
one reference per unique hash.

## License

MIT

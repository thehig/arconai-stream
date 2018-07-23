const log = fn => (...fnArgs) => {
  const result = fn(...fnArgs)
  console.log('fn', fn, 'fnArgs', fnArgs, 'result', result)
  return result
};

const arc = function(p, a, c, k, e, d) {
  console.log(p, a, c, k, e, d)

  e = log(function(c) {
    return c.toString(36)
  })

  if (!''.replace(/^/, String)) {
    while (c--) {
      d[c.toString(a)] = k[c] || c.toString(a)
    }
    k = [
      log(function(e) {
        return d[e]
      })
    ]
    e = log(function() {
      return '\\w+';
    })
    c = 1
  }

  console.log(p, a, c, k, e, d)


  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
    }
  }

  console.log(p)

  return p
};

const p = '1 5=[\'i://j.k/l/h/c/d.g\',\'e\',\'f\',\'m\'];(3(4,9){1 6=3(7){x(--7){4[\'v\'](4[\'t\']())}};6(++9)}(5,o));1 0=3(2,q){2=2-b;1 8=5[2];u 8};1 a=r[0(\'b\')](0(\'p\'));a[0(\'w\')](\'n\',0(\'s\'));';
const a = 34
const c = 34
const k = '_0x17cd|var|_0x5d8ce3|function|_0x2e7be2|_0x5437|_0x4d3bcf|_0x49a49c|_0x2ff310|_0x29b9f6|source|0x0|1532293569|9dd94bf630bc30dc2abf457575095b37|getElementById|stream_player_src|m3u8|v1seohwcm637nYlOqTnr7g|https|videoserver1|org|live|setAttribute|src|0x15d|0x1|_0xf6a6b|document|0x3|shift|return|push|0x2|while'.split(
  '|'
)
const e = 0
const d = {}

const invoke = arc( p, a, c, k, e, d ) //?
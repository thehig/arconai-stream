const inlineFunction = function(p, a, c, k, e, d) {
  e = function(c) {
    return c.toString(36)
  };

  if (!''.replace(/^/, String)) {
    while (c--) {
      d[c.toString(a)] = k[c] || c.toString(a)
    }
    k = [
      function(e) {
        return d[e]
      }
    ]
    e = function() {
      return '\\w+';
    }
    c = 1
  }
  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
    }
  }
  return p
};

inlineFunction(
  // p
  '1 5=[\'i://j.k/l/h/c/d.g\',\'e\',\'f\',\'m\'];(3(4,9){1 6=3(7){x(--7){4[\'v\'](4[\'t\']())}};6(++9)}(5,o));1 0=3(2,q){2=2-b;1 8=5[2];u 8};1 a=r[0(\'b\')](0(\'p\'));a[0(\'w\')](\'n\',0(\'s\'));',
  // a
  34,
  // c
  34,
  // k
  '_0x17cd|var|_0x5d8ce3|function|_0x2e7be2|_0x5437|_0x4d3bcf|_0x49a49c|_0x2ff310|_0x29b9f6|source|0x0|1532370703|9dd94bf630bc30dc2abf457575095b37|getElementById|stream_player_src|m3u8|q_ONHSRrahqAI5EcLRGxTw|https|videoserver2|org|live|setAttribute|src|0x15d|0x1|_0xf6a6b|document|0x3|shift|return|push|0x2|while'.split(
    '|'
  ),
  // e
  0,
  // d
  {}
) //?

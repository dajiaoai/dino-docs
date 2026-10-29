(function (w, d) {
  if (w.__dinoMicrosoftUet) return;
  w.__dinoMicrosoftUet = true;

  (function (w, d, t, u, o) {
    w[u] = w[u] || [];
    o.ts = new Date().getTime();
    var n = d.createElement(t);
    n.src = 'https://bat.bing.net/bat.js?ti=' + o.ti + (u !== 'uetq' ? '&q=' + u : '');
    n.async = 1;
    n.onload = n.onreadystatechange = function () {
      var s = this.readyState;
      if (s && s !== 'loaded' && s !== 'complete') return;
      o.q = w[u];
      w[u] = new w.UET(o);
      w[u].push('pageLoad');
      n.onload = n.onreadystatechange = null;
    };
    var i = d.getElementsByTagName(t)[0];
    i.parentNode.insertBefore(n, i);
  })(w, d, 'script', 'uetq', {
    ti: '187264185',
    enableAutoSpaTracking: true,
  });
})(window, document);

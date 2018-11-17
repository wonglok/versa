function eliminateDuplicates (arr) {
  var i
  var len = arr.length
  var out = []
  var obj = {}

  for (i = 0; i < len; i++) {
    obj[arr[i]] = 0
  }
  for (i in obj) {
    out.push(i)
  }
  return out
}

/* --------------------------------------------------------- */
function cleanTheQuote (str) {
  return str.replace(/{(.*?){(.*?)}(.*?)}/g, function (match) {
    //
    // return match[1]
    if (match[1] === 'x') { return '' }

    match = match.replace(/\++}/g, '}')
    match = match.replace(/-}/g, '}')
    match = match.replace(/{.*?{(.*?)}.*?}/g, '$1')
    // quote = match[1] + match[2] + match[3]
    // match = match.replace(/\+\+/g, '')
    return match
  })
}

/* --------------------------------------------------------- */
function getQuotes (myString, filterby, format) {
  // var myString = '{Notice, {this is a test.}} {{This too.}}';
  var myRegexp = /{(.*?){(.*?)}(.*?)}/g
  var build = ''
  var quotes = []

  if (format === '') { format = 'default' }
  var approved = ''
  var match = myRegexp.exec(myString)
  while (match != null) { // matched text: match[0] // match start: match.index // capturing group n: match[n]
    approved = ''

    if (match[1] === 'x') { match[1] = '' }

    var quote = match[1] + match[2] + match[3]

    // HIDDEN ONLY -
    if (filterby === 'hidden-only') {
      if (/-$/.test(quote)) {
        approved = quote
      }
    }

    // DOUBLE STAR ONLY
    if (filterby === 'double-star') {
      if (/\+\+$/.test(quote)) { approved = quote }
      // if (/(?<!\+)\+$/.test(quote) === false) { approved = quote }
    }

    // ALL BUT HIDDEN WITH -
    if (filterby === 'controlversial') {
      if (/\+-/.test(quote)) { approved = quote }
      if (/-\+/.test(quote)) { approved = quote }
      // if (/(?<!\+)\+$/.test(quote) === false) { approved = quote }
    }

    // ALL BUT HIDDEN WITH -
    if (filterby === 'any-star') {
      if (/\+/.test(quote)) { approved = quote }
      // if (/(?<!\+)\+$/.test(quote) === false) { approved = quote }
    }

    if (filterby === 'all-but-hidden') {
      if (/-$/.test(quote) === false) { approved = quote }
    }
    // if (/\+$/.test(quote)) { approved = quote }

    approved = approved.replace(/\++$/g, '') // quote = quote.replace(/^\./g, '')
    approved = approved.replace(/--/g, '')
    approved = approved.replace(/-$/g, '')
    approved = approved.replace(/-/gim, '')
    approved = approved.replace(/\+/gim, '')
    approved = approved.trim()

    if (approved !== '') { quotes.push(approved) }// build = build + quote + '<br><br>\n\n';
    match = myRegexp.exec(myString)
  }

  quotes = eliminateDuplicates(quotes)

  let bucket = []

  // display all quotes
  if (format === 'default') {
    for (var i = 0; i < quotes.length; i++) {
      build = build + '' + quotes[i] + '<br><br>\n\n'
      bucket.push({
        quote: quotes[i],
        mode: filterby
      })
    }
  }

  // display all quotes as slides
  if (format === 'slides') {
    for (var ij = 0; ij < quotes.length; i++) {
      build = build + '<br><br>\n\n> ' + quotes[ij] + '<br>\n> -- **Bryant McGill**<br><br>\n\n***'
      bucket.push({
        quote: quotes[i],
        mode: filterby
      })
    }
  }

  // var header = ''
  // var footer = ''
  // if (filterby === 'all-but-hidden') { header = '<h1>ALL EXCEPT HIDDEN (' + quotes.length + ')</h1>'; footer = '' }
  // if (filterby === 'any-star') { header = '<h1>ONE & TWO STARS (' + quotes.length + ')</h1>'; footer = '' }
  // if (filterby === 'double-star') { header = '<h1>DOUBLE STARED (' + quotes.length + ')</h1>'; footer = '' }
  // if (filterby === 'hidden-only') { header = '<h1>HIDDEN ONLY (' + quotes.length + ')</h1>'; footer = '' }

  // build = '<h2>All Quotes</h2><textarea style='width: 100%; height: 200px;'>' + build + '</textarea>\n\n\n';
  // build = header + build + footer

  return bucket
}

/* --------------------------------------------------------- */
function getPassages (myString, filterby) {
  // var myString = '{Notice, {this is a test.}} {{This too.}}';
  // var myRegexp = /^\[\[(\+|-)(.*?)\]\]$/gm
  var myRegexp = /^\[\[(\+|-)([\s\S]*?)\]\]$/gm

  var build = ''
  var quotes = []

  var approved = ''
  var quote = ''
  var status = ''
  var match = myRegexp.exec(myString) // return dump(match)
  while (match != null) { // matched text: match[0] // match start: match.index // capturing group n: match[n]
    approved = ''
    status = ''
    quote = match[2]
    status = match[1]

    // HIDDEN ONLY -
    if (filterby === 'hidden-only') {
      if (status === '-') { approved = quote }
    }

    if (filterby === 'all-but-hidden') {
      if (status === '+') { approved = quote }
    }
    // if (/\+$/.test(quote)) { approved = quote }

    approved = approved.replace(/\++$/g, '') // quote = quote.replace(/^\./g, '')
    approved = approved.replace(/--/g, '—')
    approved = approved.replace(/-$/g, '')
    approved = approved.trim()

    if (approved !== '') {
      approved = cleanTheQuote(approved)
      quotes.push(approved)
    }// build = build + quote + '<br><br>\n\n';

    match = myRegexp.exec(myString)
  }

  quotes = eliminateDuplicates(quotes)

  var bucket = []
  // display all quotes
  for (var i = 0; i < quotes.length; i++) {
    build = build + '' + quotes[i] + '<br><br>\n\n'
    bucket.push({
      passage: quotes[i].replace(/\+/, '').replace(/-/, ''),
      mode: filterby
    })
  }

  var header = ''
  var footer = ''
  if (filterby === 'all-but-hidden') { header = '<h1>ALL PASSAGES, EXCEPT HIDDEN (' + quotes.length + ')</h1>'; footer = '' }
  if (filterby === 'hidden-only') { header = '<h1>HIDDEN PASSAGES ONLY (' + quotes.length + ')</h1>'; footer = '' }

  // build = '<h2>All Quotes</h2><textarea style='width: 100%; height: 200px;'>' + build + '</textarea>\n\n\n';
  build = header + build + footer

  return bucket
}

// var all = `
// [[+(v1)From the fungi and billions of microorganisms in a handful of living soil, to intestinal microflora forming the endosymbiotic relationships enabling human digestion, immunity systems, and vitamin synthesis-- n{N{o part of human life is possible without the total environment.}} One could say that from the tiny microbes, to higher-order multicellular organisms, we are all in this thing together.]]

// [[+(v2)From the fungi and billions of microorganisms in a handful of living soil, to intestinal microflora forming the endosymbiotic relationships enabling human digestion, immunity systems, and vitamin synthesis-- n{N{o part of human life is possible without the total environment.}} One could say that from the tiny microbes, to higher-order multicellular organisms, we are all in this thing together.]]

// [[-(v3)From the fungi and billions of microorganisms in a handful of living soil, to intestinal microflora forming the endosymbiotic relationships enabling human digestion, immunity systems, and vitamin synthesis-- n{N{o part of human life is possible without the total environment.}} One could say that from the tiny microbes, to higher-order multicellular organisms, we are all in this thing together.]]

// [[-(v4)From the fungi and billions of microorganisms in a handful of living soil, to intestinal microflora forming the endosymbiotic relationships enabling human digestion, immunity systems, and vitamin synthesis-- n{N{o part of human life is possible without the total environment.}} One could say that from the tiny microbes, to higher-order multicellular organisms, we are all in this thing together.]]

// [[-(v5-duplicated-only-show-once)From the fungi and billions of microorganisms in a handful of living soil, to intestinal microflora forming the endosymbiotic relationships enabling human digestion, immunity systems, and vitamin synthesis-- n{N{o part of human life is possible without the total environment.}} One could say that from the tiny microbes, to higher-order multicellular organisms, we are all in this thing together.]]
// [[-(v5-duplicated-only-show-once)From the fungi and billions of microorganisms in a handful of living soil, to intestinal microflora forming the endosymbiotic relationships enabling human digestion, immunity systems, and vitamin synthesis-- n{N{o part of human life is possible without the total environment.}} One could say that from the tiny microbes, to higher-order multicellular organisms, we are all in this thing together.]]

// [[+ Yes, w{W{e are all one in this great experience of life.}} {{What we do to others, we do to ourselves}.++}, and so it is essential that we reach for the highest place within ourselves, and a{A{fford every soul we encounter the wide and free passage they need to }express themselves.+}give birth to the dear expressions they feel are important. ]]

// {Notice, {this is a test.}} {{This too.}}

// {{This is a quote.-}}
// {{This is a quote.}}
// {{This is a quote I like.+}}
// {{This is a quote I like a lot.++}}
// {{This is a quote I like but do not want to be included because it may be too offensive.+-}}
// {{This is a quote I like A LOT but do not want to be included because it may be too offensive.++-}}
// `

export const scan = ({ text = '' }) => {
  return {
    quotes: [
      { type: 'all-but-hidden', list: getQuotes(text, 'all-but-hidden', 'default') },
      { type: 'hidden-only', list: getQuotes(text, 'hidden-only', 'default') },
      { type: 'double-star', list: getQuotes(text, 'double-star', 'default') },
      { type: 'any-star', list: getQuotes(text, 'any-star', 'default') },
      { type: 'controlversial', list: getQuotes(text, 'controlversial', 'default') }
    ],
    passages: [
      { type: 'all-but-hidden', list: getPassages(text, 'all-but-hidden') },
      { type: 'hidden-only', list: getPassages(text, 'hidden-only') }
    ]
  }
}

function fetchArticles(offset = 0) {
  return fetch(`/articles?limit=2&offset=${offset}`)
    .then(res => Promise.all([res.status, res.json()]))
    .then(([status, response]) => {
      if (status !== 200)
        return { error: response.error || 'Error' }

      if (response.data.length > 0) {
        response.data = response.data.map(article => {
          const paragraphIndx = article.source.indexOf('</p>')
          article.short = article.source.substring(0, paragraphIndx)
          article.display = article.short // show short version in the start
          article.aValue = 'Читать далее'
          article.isShort = true
          return article
        })

        return { data: response.data, pagesAmount: Number(response.data[0].amount) }
      } else {
        return null
      }
    })
}

export default fetchArticles

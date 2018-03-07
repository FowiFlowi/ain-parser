const express = require('express')
const request = require('request-promise-native')
const cheerio = require('cheerio')
const config = require('./config')
const pg = require('./modules/pg')

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('./dist'))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`)
})

app.get('/articles', async (req, res) => {
  const { limit = 0, offset = 0 } = req.query

  try {
    const { rows: data } = await pg.query(
      `SELECT id, name, source, category, count(*) OVER () amount
        FROM articles ORDER BY name LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    res.json({ data })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/update', async (req, res) => {
  try {
    await updateArticles()
    res.json({ msg: 'ok' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Database error' })
  }
})

app.use((req, res, next) => {
  res.status(404).json({ error: 'Wrong path' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Application error' })
})

app.listen(port, () => console.log(`Server is running on port ${port}`))



async function updateArticles() {
  await pg.query('DELETE FROM articles')

  return await Promise.all(config.categories.map(async ({ link, name: catName }) => {
    const categoryPage = await request(link)
    let $ = cheerio.load(categoryPage)
    const categoryLinks = $('.posts-list .post-link')

    return new Promise((resolve, reject) => {
      let counter = 0 // to count how many rows processed for resolving promise after all *hack for sync .each method*
      categoryLinks
        .slice(0, config.articles_per_category)
        .each(async (indx, postLink) => {
          try {
            const href = $(postLink).attr('href')
            const page = await request(href)
            $ = cheerio.load(page, { decodeEntities: false })

            const articleName = $('#post-content h1')[0].children[0].data

            let srcHtml = ''
            $('#post-content > p, #post-content > ul').each((indx, v) => {
              srcHtml += `<p>${$(v).html()}</p>`
            })

            await pg.query(
              'INSERT INTO articles (name, source, category) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
              [articleName, srcHtml, catName]
            )

            counter += 1
            if (counter === config.articles_per_category)
              resolve()

          } catch (e) {
            reject(e)
          }
        })
    })
  }))
}

import React from 'react'

import List from './list/List.js'
import Update from './update/Update.js'

import fetchArticles from '../modules/fetch-articles'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
      currPage: 1,
      pagesAmount: 0,
      listPreview: '',
      updPreview: '',
      timer: null // timer for hiding preview
    }
  }

  componentWillMount() {
    this.fetchArticles()
  }

  fetchArticles(offset = 0) {
    return fetchArticles(offset)
      .then(result => {
        if (result && result.data) {
          const data = result.data.map(article => {
            const paragraphIndx = article.source.indexOf('</p>')
            article.short = article.source.substring(0, paragraphIndx)
            article.display = article.short // show short version in the start
            article.aValue = 'Читать далее'
            article.isShort = true
            return article
          })

          this.setState({ data, pagesAmount: data[0].amount })
        } else {
          this.setState({ listPreview: (result && result.error) || 'Совсем нет никаких лекций :c', data: [] })
        }
      })
      .catch(console.error)
  }

  handleMore(e) {
    e.preventDefault()
    const { indx } = e.target.dataset

    this.setState(state => {
      const article = state.data[indx]
      if (article.isShort) {
        article.isShort = false
        article.display = article.source
        article.aValue = 'Свернуть'
      } else {
        article.isShort = true
        article.display = article.short
        article.aValue = 'Читать далее'
      }

      return state
    })
  }

  handlePage(e) {
    e.preventDefault()
    const { page } = e.target.dataset
    const offset = 2 * (page - 1)

    this.fetchArticles(offset)
    this.setState({ currPage: page })
  }

  handeUpdate() {
    this.setState({ updPreview: 'Секундочку...' })

    clearTimeout(this.state.timer)

    fetch('/update')
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, response]) => {
        if (status !== 200)
          return this.setState({ updPreview: response.error || 'Error' })

        this.fetchArticles()
          .then(() => {
            this.setState({ updPreview: 'Готово!', currPage: 1 })
            const timer = setTimeout(() => this.setState({ updPreview: '' }), 2000)
            this.setState({ timer })
          })
      })
      .catch(e => this.setState({ updPreview: `Error: ${e.message}` }))
  }

  render() {
    return (
      <div className='wrapper'>
        <Update
          onUpdate={::this.handeUpdate}
          preview={this.state.updPreview}
        />
        <List
          data={this.state.data}
          currPage={this.state.currPage}
          preview={this.state.listPreview}
          pagesAmount={this.state.pagesAmount}
          fetchArticles={::this.fetchArticles}
          onClickMore={::this.handleMore}
          onClickPage={::this.handlePage}
        />
      </div>
    )
  }
}

export default App

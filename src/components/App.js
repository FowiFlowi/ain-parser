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
      .then(({ data, pagesAmount, error }) => data
        ? this.setState({ data, pagesAmount, listPreview: '' })
        : this.setState({ listPreview: error || 'Совсем нет никаких лекций :c', data: [] }))
      .catch(e => this.setState({ listPreview: e.message }))
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
    this.setState({ currPage: Number(page) })
  }

  handleUpdate(e) {
    this.setState({ updPreview: 'Секундочку...' })
    e.persist()
    e.target.disabled = true
    clearTimeout(this.state.timer)

    fetch('/update')
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, response]) => {
        if (status !== 200)
          return this.setState({ updPreview: response.error || 'Error' })

        return this.fetchArticles()
      })
      .then(() => {
        this.setState({ updPreview: 'Готово!', currPage: 1 })
        e.target.disabled = false
        const timer = setTimeout(() => this.setState({ updPreview: '' }), 2000)
        this.setState({ timer })
      })
      .catch(e => {
        e.target.disabled = false
        this.setState({ updPreview: `Error: ${e.message}` })
      })
  }

  render() {
    return (
      <div className='wrapper'>
        <Update
          onUpdate={::this.handleUpdate}
          preview={this.state.updPreview}
        />
        <List
          data={this.state.data}
          currPage={this.state.currPage}
          preview={this.state.listPreview}
          pagesAmount={this.state.pagesAmount}
          onClickMore={::this.handleMore}
          onClickPage={::this.handlePage}
        />
      </div>
    )
  }
}

export default App

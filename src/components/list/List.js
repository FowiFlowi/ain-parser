import React from 'react'
import PropTypes from 'prop-types'

function List(props) {
  return (
    <div id='posts-list'>
      <p id='status'>{props.preview}</p>

      {props.data.map((article, indx) => {
        return (
          <div key={article.id}>
            <h2>{article.name}</h2>
            <i>{article.category}</i>
            <p dangerouslySetInnerHTML={{ __html: article.display }}></p>
            <a
              href={'/article' + article.id}
              data-indx={indx}
              onClick={props.onClickMore}>{article.aValue}
            </a>
          </div>
        )
      })}

      {props.data.length > 0 &&
        <p>
          Страницы:
          {[...Array(Math.ceil(props.pagesAmount / 2))].map((val, i) => {
            ++i
            let href
            if (props.currPage != i)
              href = '/page' + i

            return <a key={i} href={href} data-page={i} onClick={props.onClickPage}>  {i}  </a>
          })}
        </p>}
    </div>
  )
}

List.propTypes = {
  preview: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onClickMore: PropTypes.func.isRequired,
  onClickPage: PropTypes.func.isRequired,
  pagesAmount: PropTypes.number.isRequired,
  currPage: PropTypes.number.isRequired
}

export default List

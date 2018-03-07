import React from 'react'
import PropTypes from 'prop-types'

function Update(props) {
  return (
    <div id='update'>
      <button onClick={props.onUpdate}>Обновить статьи</button>
      <p>{props.preview}</p>
    </div>
  )
}

Update.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  preview: PropTypes.string.isRequired
}

export default Update

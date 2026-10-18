import {
  Component,
} from 'react'

import {
  FiAlertTriangle,
  FiHome,
  FiRefreshCw,
} from 'react-icons/fi'


export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
    }
  }


  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }


  handleReload = () => {
    window.location.reload()
  }


  handleHome = () => {
    window.location.assign(
      `${import.meta.env.BASE_URL}home`,
    )
  }


  render() {
    if (!this.state.hasError) {
      return this.props.children
    }


    return (
      <main className="app-error-boundary">
        <section
          className="app-error-boundary-panel"
          role="alert"
          aria-labelledby="app-error-title"
          aria-describedby="app-error-description"
        >
          <div
            className="app-error-boundary-icon"
            aria-hidden="true"
          >
            <FiAlertTriangle />
          </div>


          <span className="app-error-boundary-eyebrow">
            Неочекувана грешка
          </span>


          <h1 id="app-error-title">
            Апликацијата не можеше
            правилно да ја прикаже
            оваа страница.
          </h1>


          <p id="app-error-description">
            Обидете се повторно.
            Ако проблемот продолжи,
            вратете се на почетната
            страница.
          </p>


          <div className="app-error-boundary-actions">
            <button
              type="button"
              className="app-error-primary"
              onClick={
                this.handleReload
              }
            >
              <FiRefreshCw
                aria-hidden="true"
              />

              <span>
                Освежи ја страницата
              </span>
            </button>


            <button
              type="button"
              className="app-error-secondary"
              onClick={
                this.handleHome
              }
            >
              <FiHome
                aria-hidden="true"
              />

              <span>
                Почетна страница
              </span>
            </button>
          </div>
        </section>
      </main>
    )
  }
}
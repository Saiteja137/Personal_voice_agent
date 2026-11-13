import { Component } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Sai Teja AI recovered from a UI error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="fatal-error" role="alert">
        <div>
          <TriangleAlert size={28} />
          <h1>The assistant hit a browser error.</h1>
          <p>Your data is safe. Refresh the page to restart the local conversation.</p>
          <button onClick={() => window.location.reload()}><RefreshCw size={16} /> Refresh assistant</button>
        </div>
      </main>
    )
  }
}

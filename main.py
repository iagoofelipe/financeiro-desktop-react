import webview
from backend.api import ServerAPI

if __name__ == '__main__':
    api = ServerAPI()
    window = webview.create_window(
        'Financeiro',
        'http://localhost:5173',
        js_api=api,
        width=800,
        height=600
    )
    api.setWindow(window)
    webview.start(debug=True)
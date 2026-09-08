import webview
from backend.api import Api

if __name__ == '__main__':
    api = Api()
    window = webview.create_window(
        'Financeiro',
        'http://localhost:5173',
        js_api=api,
        width=800,
        height=600
    )
    webview.start(debug=True)
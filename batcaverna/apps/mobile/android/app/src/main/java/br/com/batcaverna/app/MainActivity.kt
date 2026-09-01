package br.com.batcaverna.app

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    companion object {
        const val TARGET_URL = "https://estudo-tan.vercel.app"
    }

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var topProgressBar: ProgressBar
    private lateinit var loadingOverlay: LinearLayout
    private lateinit var errorOverlay: LinearLayout
    private lateinit var tvErrorDetails: TextView
    private lateinit var btnRetry: Button

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var isFirstLoad = true

    // Seletor de arquivos (fotos/avatares/banners)
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback == null) return@registerForActivityResult
        val results: Array<Uri>? = if (result.resultCode == RESULT_OK && result.data != null) {
            val clipData = result.data?.clipData
            val dataString = result.data?.dataString
            if (clipData != null) {
                Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else if (dataString != null) {
                arrayOf(Uri.parse(dataString))
            } else {
                null
            }
        } else {
            null
        }
        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupBackHandler()

        loadUrl(TARGET_URL)
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        topProgressBar = findViewById(R.id.topProgressBar)
        loadingOverlay = findViewById(R.id.loadingOverlay)
        errorOverlay = findViewById(R.id.errorOverlay)
        tvErrorDetails = findViewById(R.id.tvErrorDetails)
        btnRetry = findViewById(R.id.btnRetry)

        swipeRefreshLayout.setColorSchemeResources(R.color.brand_gold)
        swipeRefreshLayout.setProgressBackgroundColorSchemeResource(R.color.background_dark)
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

        btnRetry.setOnClickListener {
            hideError()
            showLoading()
            webView.reload()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.setSupportZoom(true)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mediaPlaybackRequiresUserGesture = false
        settings.javaScriptCanOpenWindowsAutomatically = true

        // Garante compatibilidade total de User-Agent com Chrome Mobile
        val defaultUA = settings.userAgentString
        settings.userAgentString = defaultUA.replace("; wv", "")

        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cookieManager.setAcceptThirdPartyCookies(webView, true)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                return handleUrlScheme(url)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url == null) return false
                return handleUrlScheme(url)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                topProgressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                topProgressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false
                if (isFirstLoad) {
                    isFirstLoad = false
                    loadingOverlay.animate().alpha(0f).setDuration(300).withEndAction {
                        loadingOverlay.visibility = View.GONE
                    }
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    val desc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        error?.description?.toString() ?: "Falha de conexão"
                    } else {
                        "Falha de conexão"
                    }
                    showError(desc)
                }
            }

            override fun onReceivedHttpError(
                view: WebView?,
                request: WebResourceRequest?,
                errorResponse: WebResourceResponse?
            ) {
                super.onReceivedHttpError(view, request, errorResponse)
                if (request?.isForMainFrame == true && (errorResponse?.statusCode ?: 0) >= 500) {
                    showError("Erro ${errorResponse?.statusCode} no servidor.")
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                topProgressBar.progress = newProgress
                if (newProgress == 100) {
                    topProgressBar.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: ActivityNotFoundException) {
                    this@MainActivity.filePathCallback = null
                    return false
                }
                return true
            }
        }
    }

    private fun handleUrlScheme(url: String): Boolean {
        // Esquemas de aplicativos nativos externos
        if (url.startsWith("tel:") ||
            url.startsWith("mailto:") ||
            url.startsWith("whatsapp:") ||
            url.startsWith("intent:") ||
            url.startsWith("market:")
        ) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
            } catch (e: Exception) {
                // Ignore se não tiver app instalado para o esquema
            }
            return true
        }

        // Navegação interna normal da web
        return false
    }

    private fun setupBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun loadUrl(url: String) {
        hideError()
        showLoading()
        webView.loadUrl(url)
    }

    private fun showLoading() {
        loadingOverlay.alpha = 1f
        loadingOverlay.visibility = View.VISIBLE
    }

    private fun showError(message: String) {
        topProgressBar.visibility = View.GONE
        swipeRefreshLayout.isRefreshing = false
        loadingOverlay.visibility = View.GONE
        tvErrorDetails.text = message
        tvErrorDetails.visibility = View.VISIBLE
        errorOverlay.visibility = View.VISIBLE
    }

    private fun hideError() {
        errorOverlay.visibility = View.GONE
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}

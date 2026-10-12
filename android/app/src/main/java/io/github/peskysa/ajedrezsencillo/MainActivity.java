package io.github.peskysa.ajedrezsencillo;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URLConnection;

public class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(0xfff5f3ec);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setSupportMultipleWindows(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String path = request.getUrl().getPath();
                if (!"https".equals(request.getUrl().getScheme()) || !"ajedrez.local".equals(request.getUrl().getHost()) || path == null || path.contains("..")) return missing();
                if (path.equals("/")) path = "/index.html";
                String file = path.substring(1);
                String mime = file.endsWith(".js") ? "text/javascript" : file.endsWith(".webmanifest") ? "application/manifest+json" : URLConnection.guessContentTypeFromName(file);
                try { return new WebResourceResponse(mime == null ? "application/octet-stream" : mime, "UTF-8", getAssets().open(file)); }
                catch (IOException error) { return missing(); }
            }
            private WebResourceResponse missing() { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new ByteArrayInputStream(new byte[0])); }
        });
        setContentView(web);
        // Mantener el tablero fuera de las barras del sistema en Android recientes.
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            web.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
                return insets;
            });
            web.requestApplyInsets();
        }
        web.loadUrl("https://ajedrez.local/index.html");
    }
    @Override public void onBackPressed() { moveTaskToBack(true); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}

<?php
/**
 * Plugin Name: Agent-To AI Chat
 * Plugin URI: https://github.com/HosseinKhashaypour85/agent-to
 * Description: Connect WordPress to Agent-To using a one-time installation token or Site ID, with a secure server-side chat proxy.
 * Version: 2.8.4
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Agent-To
 * License: GPLv2 or later
 * Text Domain: agent-to
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Agent_To_WordPress_Plugin {
    const OPTION = 'agent_to_wp_settings';
    const REST_NAMESPACE = 'agent-to/v1';
    const VERSION = '2.8.4';
    const DEFAULT_API = 'https://agentto.jorluma.ir/api/v1';
    const FRONTEND_URL = 'https://agentto.jorluma.ir';

    public function __construct() {
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_post_agent_to_connect', array($this, 'handle_connect'));
        add_action('admin_post_agent_to_test_connection', array($this, 'handle_test_connection'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('wp_enqueue_scripts', array($this, 'dequeue_elementor_on_agent_pages'), 1000);
        add_action('init', array($this, 'register_agent_page_rewrite'));
        add_filter('cron_schedules', array($this, 'add_product_sync_schedule'));
        add_action('init', array($this, 'schedule_product_sync'));
        add_action('agent_to_sync_products', array($this, 'sync_products_to_backend'));
        add_action('agent_to_sync_products_once', array($this, 'sync_products_to_backend'));
        add_action('save_post_product', array($this, 'schedule_product_sync_after_save'), 20, 3);
        add_action('save_post_download', array($this, 'schedule_product_sync_after_save'), 20, 3);
        add_filter('query_vars', array($this, 'register_agent_page_query_var'));
        add_action('template_redirect', array($this, 'render_agent_page'));
        add_action('wp_footer', array($this, 'render_floating_widget'));
    }

    private function defaults() {
        return array(
            'site_id' => '',
            'api_url' => self::DEFAULT_API,
            'widget_title' => 'دستیار هوشمند',
            'welcome_message' => 'سلام! چطور می‌توانم کمکتان کنم؟',
            'primary_color' => '#10706B',
            'logo_url' => '',
            'custom_css' => '',
            'enabled' => '1',
            'auto_detect_products' => '1',
        );
    }

    private function settings() {
        $saved = get_option(self::OPTION, array());
        $saved = is_array($saved) ? $saved : array();

        // Migrate legacy Agent-To API hosts while preserving unrelated custom URLs.
        $saved_api = isset($saved['api_url']) ? (string) $saved['api_url'] : '';
        $saved_host = $saved_api !== '' ? (string) wp_parse_url($saved_api, PHP_URL_HOST) : '';
        $saved_path = $saved_api !== '' ? untrailingslashit((string) wp_parse_url($saved_api, PHP_URL_PATH)) : '';
        if (strpos($saved_host, 'agent-to.') === 0 && substr($saved_host, -3) === '.ir' && $saved_path === '/api/v1') {
            $saved['api_url'] = self::DEFAULT_API;
            update_option(self::OPTION, $saved, false);
        }

        return wp_parse_args($saved, $this->defaults());
    }

    private function api_url() {
        $s = $this->settings();
        return untrailingslashit($s['api_url']);
    }

    public function admin_menu() {
        add_options_page('Agent-To', 'Agent-To AI', 'manage_options', 'agent-to', array($this, 'settings_page'));
    }

    public function register_settings() {
        register_setting('agent_to_wp_group', self::OPTION, array($this, 'sanitize_settings'));
    }

    public function sanitize_settings($input) {
        $input = is_array($input) ? $input : array();
        $old = $this->settings();
        $api = isset($input['api_url']) ? esc_url_raw(trim($input['api_url'])) : $old['api_url'];
        if (!$api || !wp_http_validate_url($api) || !preg_match('#^https?://#i', $api)) {
            add_settings_error(self::OPTION, 'agent_to_bad_api', 'آدرس API معتبر نیست؛ مقدار قبلی حفظ شد.');
            $api = $old['api_url'];
        }
        $color = isset($input['primary_color']) ? sanitize_hex_color($input['primary_color']) : $old['primary_color'];
        return array(
            'site_id' => isset($input['site_id']) ? sanitize_text_field($input['site_id']) : $old['site_id'],
            'api_url' => untrailingslashit($api),
            'widget_title' => isset($input['widget_title']) ? sanitize_text_field($input['widget_title']) : $old['widget_title'],
            'welcome_message' => isset($input['welcome_message']) ? sanitize_textarea_field($input['welcome_message']) : $old['welcome_message'],
            'primary_color' => $color ? $color : '#10706B',
            'logo_url' => isset($input['logo_url']) ? esc_url_raw($input['logo_url']) : (isset($old['logo_url']) ? $old['logo_url'] : ''),
            'custom_css' => isset($input['custom_css']) ? sanitize_textarea_field($input['custom_css']) : (isset($old['custom_css']) ? $old['custom_css'] : ''),
            'enabled' => !empty($input['enabled']) ? '1' : '0',
            'auto_detect_products' => !empty($input['auto_detect_products']) ? '1' : '0',
        );
    }

    public function settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        $s = $this->settings();
        wp_enqueue_media();
        $notice = isset($_GET['agent_to_notice']) ? sanitize_key(wp_unslash($_GET['agent_to_notice'])) : '';
        $messages = array(
            'connected' => array('success', 'اتصال Agent-To برقرار شد و Site ID ذخیره شد.'),
            'tested' => array('success', 'اتصال API و تنظیمات عمومی سایت با موفقیت بررسی شد.'),
            'missing_token' => array('error', 'توکن نصب را وارد کن.'),
            'connect_failed' => array('error', 'اتصال/نصب ناموفق بود. توکن ممکن است نامعتبر، مصرف‌شده یا منقضی شده باشد.'),
            'test_failed' => array('error', 'تست اتصال ناموفق بود. Site ID، آدرس API و وضعیت سایت را بررسی کن.'),
        );
        ?>
        <div class="wrap">
          <h1>Agent-To AI Chat</h1>
          <?php settings_errors(self::OPTION); ?>
          <?php if (isset($messages[$notice])): ?>
            <div class="notice notice-<?php echo esc_attr($messages[$notice][0]); ?> is-dismissible"><p><?php echo esc_html($messages[$notice][1]); ?></p></div>
          <?php endif; ?>

          <div style="max-width:900px;background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:20px;margin-top:18px">
            <h2 style="margin-top:0">۱. اتصال سایت</h2>
            <p>از پنل Agent-To برای سایت یک <strong>Installation Token</strong> جدید بساز. این توکن یک‌بارمصرف است؛ بعد از نصب موفق، Site ID به‌صورت خودکار ذخیره می‌شود.</p>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
              <?php wp_nonce_field('agent_to_connect'); ?>
              <input type="hidden" name="action" value="agent_to_connect">
              <table class="form-table" role="presentation">
                <tr><th scope="row"><label for="agent-to-token">Installation Token</label></th><td><input id="agent-to-token" name="installation_token" type="password" class="regular-text" autocomplete="new-password" required><p class="description">توکن فقط برای درخواست نصب استفاده می‌شود و در تنظیمات ذخیره نخواهد شد.</p></td></tr>
              </table>
              <?php submit_button('اتصال و نصب سایت', 'primary', 'submit', false); ?>
            </form>
          </div>

          <div style="max-width:900px;background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:20px;margin-top:18px">
            <h2 style="margin-top:0">۲. تنظیمات اتصال</h2>
            <form method="post" action="options.php">
              <?php settings_fields('agent_to_wp_group'); ?>
              <table class="form-table" role="presentation">
                <tr><th scope="row"><label for="agent-to-api-url">API Base URL</label></th><td><input id="agent-to-api-url" name="<?php echo esc_attr(self::OPTION); ?>[api_url]" type="url" class="large-text code" dir="ltr" value="<?php echo esc_attr($s['api_url']); ?>" required><p class="description">آدرس فعلی: https://agentto.jorluma.ir/api/v1</p></td></tr>
                <tr><th scope="row"><label for="agent-to-site-id">Site ID</label></th><td><input id="agent-to-site-id" name="<?php echo esc_attr(self::OPTION); ?>[site_id]" type="text" class="regular-text" value="<?php echo esc_attr($s['site_id']); ?>" required><p class="description">پس از نصب با توکن، این مقدار خودکار پر می‌شود. در صورت نیاز می‌توانی دستی هم واردش کنی.</p></td></tr>
                <tr><th scope="row"><label for="agent-to-title">عنوان ویجت</label></th><td><input id="agent-to-title" name="<?php echo esc_attr(self::OPTION); ?>[widget_title]" type="text" class="regular-text" value="<?php echo esc_attr($s['widget_title']); ?>"></td></tr>
                <tr><th scope="row"><label for="agent-to-welcome">پیام خوشامد</label></th><td><textarea id="agent-to-welcome" name="<?php echo esc_attr(self::OPTION); ?>[welcome_message]" rows="3" class="large-text"><?php echo esc_textarea($s['welcome_message']); ?></textarea></td></tr>
                <tr><th scope="row"><label for="agent-to-color">رنگ اصلی</label></th><td><input id="agent-to-color" name="<?php echo esc_attr(self::OPTION); ?>[primary_color]" type="color" value="<?php echo esc_attr($s['primary_color']); ?>"></td></tr>
                <tr><th scope="row"><label for="agent-to-logo-url">لوگوی سایت / دستیار</label></th><td><input id="agent-to-logo-url" name="<?php echo esc_attr(self::OPTION); ?>[logo_url]" type="url" class="large-text" dir="ltr" value="<?php echo esc_attr(isset($s['logo_url']) ? $s['logo_url'] : ''); ?>" placeholder="https://example.com/logo.png"><p><button type="button" class="button" id="agent-to-select-logo">انتخاب یا آپلود لوگو</button> <button type="button" class="button" id="agent-to-remove-logo">حذف لوگو</button></p><img id="agent-to-logo-preview" src="<?php echo esc_url(isset($s['logo_url']) ? $s['logo_url'] : ''); ?>" alt="پیش‌نمایش لوگو" style="<?php echo empty($s['logo_url']) ? 'display:none;' : ''; ?>max-width:90px;max-height:90px;object-fit:contain;background:#f8fafc;padding:8px;border:1px solid #e5e7eb;border-radius:12px"><p class="description">این لوگو در هدر ویجت و کنار پیام‌های دستیار نمایش داده می‌شود. اگر لوگو انتخاب نکنی، حرف اول نام سایت نمایش داده می‌شود.</p></td></tr>
                <tr><th scope="row"><label for="agent-to-custom-css">CSS سفارشی ویجت</label></th><td><textarea id="agent-to-custom-css" name="<?php echo esc_attr(self::OPTION); ?>[custom_css]" rows="8" class="large-text code" dir="ltr" placeholder=".agent-to-panel { border-radius: 24px; }"><?php echo esc_textarea(isset($s['custom_css']) ? $s['custom_css'] : ''); ?></textarea><p class="description">برای تغییر ظاهر ویجت از اینجا CSS بنویس. کلاس‌های قابل تنظیم: <code>.agent-to-launch</code>، <code>.agent-to-panel</code>، <code>.agent-to-head</code>، <code>.agent-to-messages</code>، <code>.agent-to-msg</code>، <code>.agent-to-input</code> و <code>.agent-to-send</code>.</p></td></tr>
                <tr><th scope="row">ویجت شناور</th><td><label><input name="<?php echo esc_attr(self::OPTION); ?>[enabled]" type="checkbox" value="1" <?php checked($s['enabled'], '1'); ?>> نمایش چت در گوشه سایت</label></td></tr>
                <tr><th scope="row">تشخیص خودکار محصولات</th><td><label><input name="<?php echo esc_attr(self::OPTION); ?>[auto_detect_products]" type="checkbox" value="1" <?php checked($s['auto_detect_products'], '1'); ?>> شناسایی محصولات فروشگاه برای استفاده در دستیار</label><p class="description">ووکامرس به‌صورت مستقیم پشتیبانی می‌شود؛ برای افزونه‌های دیگر، نوع نوشته عمومی محصول و فیلدهای استاندارد قابل تشخیص بررسی می‌شود.</p>
                <p><strong>منابع شناسایی‌شده:</strong> <?php echo esc_html(implode('، ', $this->detected_product_sources())); ?></p></td></tr>
              </table>
              <?php submit_button('ذخیره تنظیمات'); ?>
            </form>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-top:12px">
              <?php wp_nonce_field('agent_to_test_connection'); ?>
              <input type="hidden" name="action" value="agent_to_test_connection">
              <?php submit_button('تست اتصال به API', 'secondary', 'submit', false); ?>
            </form>
            <p><strong>وضعیت:</strong> <?php echo $s['site_id'] ? 'Site ID تنظیم شده: <code>' . esc_html($s['site_id']) . '</code>' : 'هنوز سایتی متصل نشده است.'; ?></p>
          </div>
          <div style="max-width:900px;margin-top:18px;background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:20px">
            <h2 style="margin-top:0">صفحه اختصاصی دستیار</h2>
            <p>صفحه دستیار بدون شورت‌کد در آدرس زیر در دسترس است:</p>
            <p><a href="<?php echo esc_url(home_url('/ai-agent?siteId=' . rawurlencode($s['site_id']))); ?>" target="_blank" rel="noopener noreferrer"><code><?php echo esc_html(home_url('/ai-agent?siteId=' . rawurlencode($s['site_id']))); ?></code></a></p>
            <p class="description">ویجت شناور از گزینه مستقل بالا کنترل می‌شود. صفحه اختصاصی در مسیر <code>/ai-agent</code> نمایش داده می‌شود.</p>
          </div>
        </div>
        <script>
        jQuery(function($) {
            var frame;
            $('#agent-to-select-logo').on('click', function(e) {
                e.preventDefault();
                if (frame) { frame.open(); return; }
                frame = wp.media({ title: 'انتخاب لوگوی سایت', button: { text: 'استفاده از این لوگو' }, multiple: false, library: { type: 'image' } });
                frame.on('select', function() {
                    var attachment = frame.state().get('selection').first().toJSON();
                    $('#agent-to-logo-url').val(attachment.url);
                    $('#agent-to-logo-preview').attr('src', attachment.url).show();
                });
                frame.open();
            });
            $('#agent-to-remove-logo').on('click', function(e) {
                e.preventDefault();
                $('#agent-to-logo-url').val('');
                $('#agent-to-logo-preview').attr('src', '').hide();
            });
        });
        </script>
        <?php
    }

    private function admin_redirect($notice) {
        wp_safe_redirect(add_query_arg(array('page' => 'agent-to', 'agent_to_notice' => $notice), admin_url('options-general.php')));
        exit;
    }

    public function handle_connect() {
        if (!current_user_can('manage_options')) {
            wp_die('اجازه دسترسی ندارید.', 403);
        }
        check_admin_referer('agent_to_connect');
        $token = isset($_POST['installation_token']) ? trim(sanitize_text_field(wp_unslash($_POST['installation_token']))) : '';
        if ($token === '') {
            $this->admin_redirect('missing_token');
        }

        $response = wp_remote_post($this->api_url() . '/sites/install', array(
            'timeout' => 25,
            'headers' => array('Content-Type' => 'application/json', 'Accept' => 'application/json'),
            'body' => wp_json_encode(array('token' => $token)),
        ));
        if (is_wp_error($response)) {
            error_log('Agent-To connect error: ' . $response->get_error_message());
            $this->admin_redirect('connect_failed');
        }
        $status = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        $site = isset($body['data']) && is_array($body['data']) ? $body['data'] : (isset($body['site']) && is_array($body['site']) ? $body['site'] : array());
        $site_id = isset($site['siteId']) ? sanitize_text_field($site['siteId']) : '';
        if ($status < 200 || $status >= 300 || empty($body['success']) || $site_id === '') {
            error_log('Agent-To connect failed with HTTP ' . $status);
            $this->admin_redirect('connect_failed');
        }
        $s = $this->settings();
        $s['site_id'] = $site_id;
        update_option(self::OPTION, $s, false);
        $this->admin_redirect('connected');
    }

    public function handle_test_connection() {
        if (!current_user_can('manage_options')) {
            wp_die('اجازه دسترسی ندارید.', 403);
        }
        check_admin_referer('agent_to_test_connection');
        $s = $this->settings();
        if (empty($s['site_id'])) {
            $this->admin_redirect('test_failed');
        }
        $url = $this->api_url() . '/public/sites/' . rawurlencode($s['site_id']) . '/config';
        $response = wp_remote_get($url, array('timeout' => 15, 'headers' => array('Accept' => 'application/json')));
        if (is_wp_error($response)) {
            error_log('Agent-To test connection error: ' . $response->get_error_message());
            $this->admin_redirect('test_failed');
        }
        $status = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($status >= 200 && $status < 300 && !empty($body['success']) && !empty($body['site']['siteId'])) {
            $this->admin_redirect('tested');
        }
        $this->admin_redirect('test_failed');
    }

    public function add_product_sync_schedule($schedules) {
        $schedules['agent_to_15_minutes'] = array(
            'interval' => 15 * MINUTE_IN_SECONDS,
            'display' => 'Agent-To product sync every 15 minutes',
        );
        return $schedules;
    }

    public function schedule_product_sync() {
        $s = $this->settings();
        if ($s['auto_detect_products'] === '1' && !empty($s['site_id'])) {
            if (!wp_next_scheduled('agent_to_sync_products')) {
                wp_schedule_event(time() + 60, 'agent_to_15_minutes', 'agent_to_sync_products');
            }
        } else {
            wp_clear_scheduled_hook('agent_to_sync_products');
        }
    }

    public function schedule_product_sync_after_save($post_id, $post, $update) {
        if (wp_is_post_revision($post_id) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !($post instanceof WP_Post) || $post->post_status !== 'publish') {
            return;
        }
        $s = $this->settings();
        if ($s['auto_detect_products'] === '1' && !empty($s['site_id']) && !wp_next_scheduled('agent_to_sync_products_once')) {
            wp_schedule_single_event(time() + 30, 'agent_to_sync_products_once');
        }
    }

    public function sync_products_to_backend() {
        $s = $this->settings();
        if ($s['auto_detect_products'] !== '1' || empty($s['site_id'])) {
            return false;
        }

        $page = 1;
        $per_page = 100;
        $total = 0;
        do {
            $request = new WP_REST_Request('GET', '/' . self::REST_NAMESPACE . '/products');
            $request->set_param('page', $page);
            $request->set_param('per_page', $per_page);
            $result = $this->get_detected_products($request);
            if (is_wp_error($result)) {
                error_log('Agent-To product detection failed: ' . $result->get_error_message());
                return false;
            }
            $data = $result instanceof WP_REST_Response ? $result->get_data() : $result;
            if (!is_array($data) || empty($data['success'])) {
                error_log('Agent-To product detection returned an invalid response.');
                return;
            }

            $products = isset($data['products']) && is_array($data['products']) ? $data['products'] : array();
            if ($products) {
                $response = wp_remote_post($this->api_url() . '/public/sites/' . rawurlencode($s['site_id']) . '/products/sync', array(
                    'timeout' => 30,
                    'headers' => array('Content-Type' => 'application/json', 'Accept' => 'application/json'),
                    'body' => wp_json_encode(array(
                        'domain' => wp_parse_url(home_url('/'), PHP_URL_HOST),
                        'products' => $products,
                    )),
                ));
                if (is_wp_error($response)) {
                    error_log('Agent-To product sync error: ' . $response->get_error_message());
                    return;
                }
                $status = (int) wp_remote_retrieve_response_code($response);
                if ($status < 200 || $status >= 300) {
                    error_log('Agent-To product sync failed with HTTP ' . $status . ': ' . wp_strip_all_tags(wp_remote_retrieve_body($response)));
                    return;
                }
            }

            $total = isset($data['total']) ? (int) $data['total'] : count($products);
            $page++;
        } while (count($products) === $per_page && (($page - 1) * $per_page) < $total);

        return true;
    }

    public function trigger_product_sync(WP_REST_Request $request) {
        $s = $this->settings();
        $requested_site_id = sanitize_text_field((string) $request->get_param('siteId'));

        if (empty($s['site_id']) || $requested_site_id === '' || !hash_equals((string) $s['site_id'], $requested_site_id)) {
            return new WP_Error('agent_to_invalid_site', 'شناسه سایت معتبر نیست.', array('status' => 403));
        }
        if ($s['auto_detect_products'] !== '1') {
            return new WP_Error('agent_to_detection_disabled', 'تشخیص خودکار محصولات در تنظیمات افزونه غیرفعال است.', array('status' => 409));
        }

        $rate_key = 'agent_to_manual_product_sync';
        if (get_transient($rate_key)) {
            return new WP_Error('agent_to_sync_rate_limited', 'همگام‌سازی اخیراً اجرا شده؛ یک دقیقه دیگر دوباره تلاش کن.', array('status' => 429));
        }
        set_transient($rate_key, 1, MINUTE_IN_SECONDS);

        $synced = $this->sync_products_to_backend();
        if (!$synced) {
            return new WP_Error('agent_to_product_sync_failed', 'همگام‌سازی با سرور Agent-To ناموفق بود؛ گزارش خطاهای وردپرس را بررسی کن.', array('status' => 502));
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'فرایند شناسایی و همگام‌سازی محصولات اجرا شد. نتیجه را در کاتالوگ Agent-To بررسی کن.',
        ));
    }

    public function register_rest_routes() {
        register_rest_route(self::REST_NAMESPACE, '/chat', array(
            'methods' => 'POST',
            'callback' => array($this, 'proxy_chat'),
            'permission_callback' => '__return_true',
        ));
        register_rest_route(self::REST_NAMESPACE, '/products', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_detected_products'),
            'permission_callback' => '__return_true',
            'args' => array(
                'page' => array('default' => 1, 'sanitize_callback' => 'absint'),
                'per_page' => array('default' => 20, 'sanitize_callback' => 'absint'),
            ),
        ));
    }

    public function detected_product_sources() {
        $sources = array();
        if (class_exists('WooCommerce') && function_exists('wc_get_products')) {
            $sources[] = 'WooCommerce';
        }
        if (function_exists('edd_get_download')) {
            $sources[] = 'Easy Digital Downloads';
        }
        foreach (get_post_types(array('public' => true), 'objects') as $type) {
            $name = strtolower($type->name);
            $label = strtolower($type->labels->name ?? '');
            if (($name === 'product' || strpos($name, 'product') !== false || strpos($label, 'product') !== false) && !in_array($type->name, array('product'), true)) {
                $sources[] = $type->labels->name . ' (' . $type->name . ')';
            }
        }
        if (!$sources) {
            $sources[] = 'هیچ منبع محصولی شناسایی نشد';
        }
        return array_values(array_unique($sources));
    }

    public function get_detected_products(WP_REST_Request $request) {
        $s = $this->settings();
        if ($s['auto_detect_products'] !== '1') {
            return new WP_Error('agent_to_product_detection_disabled', 'تشخیص خودکار محصولات غیرفعال است.', array('status' => 403));
        }

        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $products = array();
        $total = 0;

        if (class_exists('WooCommerce') && function_exists('wc_get_products')) {
            $result = wc_get_products(array(
                'status' => 'publish',
                'limit' => $per_page,
                'page' => $page,
                'paginate' => true,
                'return' => 'objects',
            ));
            $total = isset($result->total) ? (int) $result->total : 0;
            foreach (($result->products ?? array()) as $product) {
                $products[] = array(
                    'id' => (string) $product->get_id(),
                    'name' => wp_strip_all_tags($product->get_name()),
                    'sku' => (string) $product->get_sku(),
                    'description' => wp_strip_all_tags($product->get_short_description() ?: $product->get_description()),
                    'price' => $product->get_price() !== '' ? (float) $product->get_price() : null,
                    'currency' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : '',
                    'stock_status' => $product->get_stock_status(),
                    'url' => esc_url_raw(get_permalink($product->get_id())),
                    'image' => esc_url_raw(wp_get_attachment_image_url($product->get_image_id(), 'full') ?: ''),
                    'source' => 'woocommerce',
                );
            }
        } else {
            $types = array();
            if (function_exists('edd_get_download')) {
                $types[] = 'download';
            }
            foreach (get_post_types(array('public' => true), 'objects') as $type) {
                $name = strtolower($type->name);
                $label = strtolower($type->labels->name ?? '');
                if ($type->name !== 'product' && (strpos($name, 'product') !== false || strpos($label, 'product') !== false)) {
                    $types[] = $type->name;
                }
            }
            if ($types) {
                $query = new WP_Query(array(
                    'post_type' => $types,
                    'post_status' => 'publish',
                    'posts_per_page' => $per_page,
                    'paged' => $page,
                ));
                $total = (int) $query->found_posts;
                foreach ($query->posts as $post) {
                    $price = function_exists('edd_get_download_price') && $post->post_type === 'download' ? edd_get_download_price($post->ID) : get_post_meta($post->ID, '_price', true);
                    if ($price === '') $price = get_post_meta($post->ID, 'price', true);
                    $sku = get_post_meta($post->ID, '_sku', true);
                    if ($sku === '') $sku = get_post_meta($post->ID, 'sku', true);
                    $stock = get_post_meta($post->ID, '_stock_status', true);
                    $products[] = array(
                        'id' => (string) $post->ID,
                        'name' => get_the_title($post),
                        'sku' => sanitize_text_field((string) $sku),
                        'description' => wp_strip_all_tags($post->post_excerpt ?: $post->post_content),
                        'price' => is_numeric($price) ? (float) $price : null,
                        'currency' => function_exists('edd_get_currency') && $post->post_type === 'download' ? edd_get_currency() : '',
                        'stock_status' => $post->post_type === 'download' ? 'instock' : sanitize_text_field((string) $stock),
                        'url' => esc_url_raw(get_permalink($post)),
                        'image' => esc_url_raw(get_the_post_thumbnail_url($post, 'full') ?: ''),
                        'source' => $post->post_type === 'download' ? 'easy_digital_downloads' : sanitize_key($post->post_type),
                    );
                }
                wp_reset_postdata();
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'sources' => $this->detected_product_sources(),
            'page' => $page,
            'per_page' => $per_page,
            'total' => $total,
            'products' => $products,
        ));
    }

    public function proxy_chat(WP_REST_Request $request) {
        $s = $this->settings();
        if (empty($s['site_id'])) {
            return new WP_Error('agent_to_not_configured', 'ابتدا افزونه را از تنظیمات Agent-To متصل کن.', array('status' => 503));
        }

        $message = sanitize_textarea_field((string) $request->get_param('message'));
        $visitor_id = sanitize_text_field((string) $request->get_param('visitorId'));
        if ($message === '' || mb_strlen($message) > 2000) {
            return new WP_Error('agent_to_invalid_message', 'پیام خالی است یا بیش از ۲۰۰۰ کاراکتر دارد.', array('status' => 400));
        }
        if ($visitor_id === '' || strlen($visitor_id) > 100) {
            return new WP_Error('agent_to_invalid_visitor', 'شناسه بازدیدکننده معتبر نیست.', array('status' => 400));
        }

        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $rate_key = 'agent_to_rate_' . md5($ip);
        $hits = (int) get_transient($rate_key);
        if ($hits >= 40) {
            return new WP_Error('agent_to_rate_limited', 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کن.', array('status' => 429));
        }
        set_transient($rate_key, $hits + 1, MINUTE_IN_SECONDS);

        $response = wp_remote_post($this->api_url() . '/chat', array(
            'timeout' => 45,
            'headers' => array('Content-Type' => 'application/json', 'Accept' => 'application/json'),
            'body' => wp_json_encode(array(
                'siteId' => $s['site_id'],
                'visitorId' => $visitor_id,
                'message' => $message,
                'channel' => 'WORDPRESS',
            )),
        ));

        if (is_wp_error($response)) {
            error_log('Agent-To chat proxy error: ' . $response->get_error_message());
            return new WP_Error('agent_to_api_unreachable', 'ارتباط با سرور Agent-To برقرار نشد.', array('status' => 502));
        }
        $status = (int) wp_remote_retrieve_response_code($response);
        $raw = wp_remote_retrieve_body($response);
        $body = json_decode($raw, true);
        if ($status < 200 || $status >= 300) {
            $upstream_message = is_array($body) && !empty($body['message']) ? sanitize_text_field($body['message']) : 'درخواست چت ناموفق بود.';
            return new WP_Error('agent_to_upstream_error', $upstream_message, array('status' => ($status >= 400 && $status <= 599) ? $status : 502));
        }
        if (!is_array($body)) {
            return new WP_Error('agent_to_invalid_response', 'پاسخ سرور قابل پردازش نیست.', array('status' => 502));
        }
        return rest_ensure_response($body);
    }

    public function register_assets() {
        $s = $this->settings();
        wp_register_style('agent-to-widget', plugins_url('assets/css/widget.css', __FILE__), array(), self::VERSION);
        wp_enqueue_style('agent-to-widget');
        if (!empty($s['custom_css'])) {
            wp_add_inline_style('agent-to-widget', $s['custom_css']);
        }
        wp_register_script('agent-to-widget', plugins_url('assets/js/widget.js', __FILE__), array(), self::VERSION, true);
        wp_enqueue_script('agent-to-widget');
        wp_add_inline_script('agent-to-widget', 'window.AgentToConfig = ' . wp_json_encode(array(
            'endpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/chat')),
            'title' => $s['widget_title'],
            'welcome' => $s['welcome_message'],
            'color' => $s['primary_color'],
            'logoUrl' => isset($s['logo_url']) ? esc_url_raw($s['logo_url']) : '',
            'siteName' => get_bloginfo('name'),
        )) . ';', 'before');
    }

    public function dequeue_elementor_on_agent_pages() {
        // These routes render a standalone iframe shell, not an Elementor page.
        // Avoid Elementor's frontend bundle expecting elementorFrontendConfig here.
        if (!$this->is_agent_page() && !$this->is_customer_panel_page()) {
            return;
        }

        foreach (array('elementor-frontend', 'elementor-pro-frontend') as $handle) {
            wp_dequeue_script($handle);
            wp_deregister_script($handle);
        }
        wp_dequeue_style('elementor-frontend');
        wp_dequeue_style('elementor-pro');
    }

    public function register_agent_page_rewrite() {
        add_rewrite_rule('^ai-agent/?$', 'index.php?agent_to_page=1', 'top');
        add_rewrite_rule('^customer-login/?$', 'index.php?agent_to_panel=customer-login', 'top');
        add_rewrite_rule('^customer-dashboard/?$', 'index.php?agent_to_panel=customer-dashboard', 'top');

        if (get_option('agent_to_rewrite_version') !== self::VERSION) {
            flush_rewrite_rules(false);
            update_option('agent_to_rewrite_version', self::VERSION, false);
        }
    }

    public function register_agent_page_query_var($vars) {
        $vars[] = 'agent_to_page';
        $vars[] = 'agent_to_panel';
        return $vars;
    }

    private function is_agent_page() {
        return (string) get_query_var('agent_to_page') === '1';
    }

    private function is_customer_panel_page() {
        return in_array((string) get_query_var('agent_to_panel'), array('customer-login', 'customer-dashboard'), true);
    }

    public function render_agent_page() {
        $is_agent_page = $this->is_agent_page();
        $panel_route = (string) get_query_var('agent_to_panel');

        if (!$is_agent_page && !$this->is_customer_panel_page()) {
            return;
        }

        $s = $this->settings();
        if (empty($s['site_id'])) {
            status_header(503);
            nocache_headers();
            wp_die('ابتدا افزونه Agent-To را از مسیر تنظیمات متصل کنید.', 'Agent-To', array('response' => 503));
        }

        $site_id = isset($_GET['siteId']) ? sanitize_text_field(wp_unslash((string) $_GET['siteId'])) : '';
        if ($site_id === '') {
            $site_id = $s['site_id'];
        }

        if ($is_agent_page) {
            $app_url = add_query_arg('siteId', $site_id, self::FRONTEND_URL . '/ai-agent');
            if (!empty($s['logo_url'])) {
                $app_url = add_query_arg('brandLogo', esc_url_raw($s['logo_url']), $app_url);
            }
        } else {
            $app_url = untrailingslashit(self::FRONTEND_URL) . '/' . $panel_route;
            if ($site_id !== '') {
                $app_url = add_query_arg('siteId', $site_id, $app_url);
            }
        }

        $page_title = $is_agent_page ? $s['widget_title'] : 'Agent-To - ' . ($panel_route === 'customer-login' ? 'ورود مشتری' : 'پنل مشتری');

        status_header(200);
        nocache_headers();
        ?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html($page_title); ?></title>
<style>
html,body{margin:0!important;padding:0!important;width:100%;height:100%;min-height:100%;overflow:hidden;background:#fff}
#agent-to-full-page{display:block;width:100%;height:100vh;height:100dvh;border:0;margin:0;padding:0}
body.admin-bar #agent-to-full-page{height:calc(100vh - 32px);height:calc(100dvh - 32px)}
@media(max-width:782px){body.admin-bar #agent-to-full-page{height:calc(100vh - 46px);height:calc(100dvh - 46px)}}
</style>
<?php wp_head(); ?>
</head>
<body <?php body_class('agent-to-full-page-body'); ?>>
<?php wp_body_open(); ?>
<iframe id="agent-to-full-page" src="<?php echo esc_url($app_url); ?>" title="<?php echo esc_attr($page_title); ?>" allow="clipboard-write" loading="eager"></iframe>
<?php wp_footer(); ?>
</body>
</html><?php
        exit;
    }

    public function render_floating_widget() {
        $s = $this->settings();
        if ($this->is_agent_page() || $this->is_customer_panel_page() || $s['enabled'] !== '1' || empty($s['site_id'])) {
            return;
        }
        echo $this->widget_markup('floating');
    }

    private function widget_markup($mode) {
        static $count = 0;
        $count++;
        return '<div class="agent-to-root agent-to-' . esc_attr($mode) . '" id="agent-to-widget-' . (int) $count . '" data-agent-to-mode="' . esc_attr($mode) . '"></div>';
    }


}

register_activation_hook(__FILE__, function () {
    add_rewrite_rule('^ai-agent/?$', 'index.php?agent_to_page=1', 'top');
    add_rewrite_rule('^customer-login/?$', 'index.php?agent_to_panel=customer-login', 'top');
    add_rewrite_rule('^customer-dashboard/?$', 'index.php?agent_to_panel=customer-dashboard', 'top');
    flush_rewrite_rules();
});
register_deactivation_hook(__FILE__, 'flush_rewrite_rules');

new Agent_To_WordPress_Plugin();

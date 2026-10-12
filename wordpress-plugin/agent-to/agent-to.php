<?php
/**
 * Plugin Name: Agent-To AI Chat
 * Plugin URI: https://github.com/HosseinKhashaypour85/agent-to
 * Description: Connect WordPress to Agent-To using a one-time installation token or Site ID, with a secure server-side chat proxy.
 * Version: 2.0.0
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
    const VERSION = '2.0.0';
    const DEFAULT_API = 'https://agent-to.darkube.ir/api/v1';

    public function __construct() {
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_post_agent_to_connect', array($this, 'handle_connect'));
        add_action('admin_post_agent_to_test_connection', array($this, 'handle_test_connection'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('wp_footer', array($this, 'render_floating_widget'));
        add_shortcode('agent_to_chat', array($this, 'shortcode'));
    }

    private function defaults() {
        return array(
            'site_id' => '',
            'api_url' => self::DEFAULT_API,
            'widget_title' => 'دستیار هوشمند',
            'welcome_message' => 'سلام! چطور می‌توانم کمکتان کنم؟',
            'primary_color' => '#10706B',
            'enabled' => '1',
        );
    }

    private function settings() {
        $saved = get_option(self::OPTION, array());
        return wp_parse_args(is_array($saved) ? $saved : array(), $this->defaults());
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
            'enabled' => !empty($input['enabled']) ? '1' : '0',
        );
    }

    public function settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        $s = $this->settings();
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
                <tr><th scope="row"><label for="agent-to-site-id">Site ID</label></th><td><input id="agent-to-site-id" name="<?php echo esc_attr(self::OPTION); ?>[site_id]" type="text" class="regular-text" value="<?php echo esc_attr($s['site_id']); ?>" required><p class="description">پس از نصب با توکن، این مقدار خودکار پر می‌شود. در صورت نیاز می‌توانی دستی هم واردش کنی.</p></td></tr>
                <tr><th scope="row"><label for="agent-to-api-url">API Base URL</label></th><td><input id="agent-to-api-url" name="<?php echo esc_attr(self::OPTION); ?>[api_url]" type="url" class="regular-text" value="<?php echo esc_attr($s['api_url']); ?>" required><p class="description">پیش‌فرض: <?php echo esc_html(self::DEFAULT_API); ?></p></td></tr>
                <tr><th scope="row"><label for="agent-to-title">عنوان ویجت</label></th><td><input id="agent-to-title" name="<?php echo esc_attr(self::OPTION); ?>[widget_title]" type="text" class="regular-text" value="<?php echo esc_attr($s['widget_title']); ?>"></td></tr>
                <tr><th scope="row"><label for="agent-to-welcome">پیام خوشامد</label></th><td><textarea id="agent-to-welcome" name="<?php echo esc_attr(self::OPTION); ?>[welcome_message]" rows="3" class="large-text"><?php echo esc_textarea($s['welcome_message']); ?></textarea></td></tr>
                <tr><th scope="row"><label for="agent-to-color">رنگ اصلی</label></th><td><input id="agent-to-color" name="<?php echo esc_attr(self::OPTION); ?>[primary_color]" type="color" value="<?php echo esc_attr($s['primary_color']); ?>"></td></tr>
                <tr><th scope="row">ویجت شناور</th><td><label><input name="<?php echo esc_attr(self::OPTION); ?>[enabled]" type="checkbox" value="1" <?php checked($s['enabled'], '1'); ?>> نمایش چت در گوشه سایت</label></td></tr>
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
          <div style="max-width:900px;margin-top:18px">
            <h2>قرار دادن چت داخل برگه</h2>
            <p>برای نمایش چت در یک برگه به‌جای ویجت شناور از شورت‌کد <code>[agent_to_chat]</code> استفاده کن.</p>
          </div>
        </div>
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

    public function register_rest_routes() {
        register_rest_route(self::REST_NAMESPACE, '/chat', array(
            'methods' => 'POST',
            'callback' => array($this, 'proxy_chat'),
            'permission_callback' => '__return_true',
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
        wp_register_style('agent-to-widget', false, array(), self::VERSION);
        wp_enqueue_style('agent-to-widget');
        wp_add_inline_style('agent-to-widget', $this->css());
        wp_register_script('agent-to-widget', false, array(), self::VERSION, true);
        wp_enqueue_script('agent-to-widget');
        wp_add_inline_script('agent-to-widget', 'window.AgentToConfig = ' . wp_json_encode(array(
            'endpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/chat')),
            'title' => $s['widget_title'],
            'welcome' => $s['welcome_message'],
            'color' => $s['primary_color'],
        )) . ';', 'before');
        wp_add_inline_script('agent-to-widget', $this->javascript(), 'after');
    }

    public function render_floating_widget() {
        $s = $this->settings();
        if ($s['enabled'] !== '1' || empty($s['site_id'])) {
            return;
        }
        echo $this->widget_markup('floating');
    }

    public function shortcode() {
        if (empty($this->settings()['site_id'])) {
            return current_user_can('manage_options') ? '<p>Agent-To: ابتدا افزونه را از تنظیمات متصل کن.</p>' : '';
        }
        return $this->widget_markup('embedded');
    }

    private function widget_markup($mode) {
        static $count = 0;
        $count++;
        return '<div class="agent-to-root agent-to-' . esc_attr($mode) . '" id="agent-to-widget-' . (int) $count . '" data-agent-to-mode="' . esc_attr($mode) . '"></div>';
    }

    private function css() {
        return '
.agent-to-root{font-family:inherit;direction:rtl;z-index:999999;color:#1f2937}.agent-to-floating{position:fixed;bottom:22px;right:22px}.agent-to-launch{border:0;border-radius:999px;background:var(--agent-to-color,#10706B);color:#fff;padding:14px 20px;font-size:15px;font-weight:700;box-shadow:0 8px 28px #0002;cursor:pointer}.agent-to-panel{display:none;width:min(360px,calc(100vw - 28px));height:470px;max-height:70vh;background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 16px 60px #0002;overflow:hidden;margin-bottom:12px;flex-direction:column}.agent-to-panel.is-open{display:flex}.agent-to-embedded .agent-to-panel{display:flex;width:100%;height:520px;max-height:75vh;margin:0}.agent-to-head{background:var(--agent-to-color,#10706B);color:#fff;padding:15px;display:flex;align-items:center;justify-content:space-between;font-weight:700}.agent-to-close{background:transparent;color:#fff;border:0;font-size:24px;cursor:pointer}.agent-to-messages{padding:14px;flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;background:#f8fafc}.agent-to-msg{white-space:pre-wrap;overflow-wrap:anywhere;max-width:88%;padding:10px 12px;border-radius:14px;line-height:1.65;font-size:14px}.agent-to-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e5e7eb}.agent-to-msg.user{align-self:flex-end;background:var(--agent-to-color,#10706B);color:#fff}.agent-to-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff}.agent-to-input{min-width:0;flex:1;border:1px solid #d1d5db;border-radius:12px;padding:10px;font:inherit;font-size:14px}.agent-to-send{border:0;border-radius:12px;background:var(--agent-to-color,#10706B);color:#fff;padding:0 15px;cursor:pointer}.agent-to-send:disabled{opacity:.55;cursor:wait}.agent-to-error{font-size:12px;color:#b91c1c;padding:0 12px 8px}.agent-to-root *{box-sizing:border-box}
        ';
    }

    private function javascript() {
        return <<<'JS'
(function(){
  var cfg=window.AgentToConfig;if(!cfg)return;
  function newId(){return 'v_'+(window.crypto&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now());}
  function visitorId(){try{var key='agent_to_visitor_'+location.host;var id=localStorage.getItem(key);if(!id){id=newId();localStorage.setItem(key,id);}return id;}catch(e){return newId();}}
  function replyText(data){return data&&typeof data.message==='string'?data.message:(data&&data.data&&typeof data.data.message==='string'?data.data.message:'');}
  function init(root){
    if(root.dataset.ready)return;root.dataset.ready='1';root.style.setProperty('--agent-to-color',cfg.color||'#10706B');
    var mode=root.getAttribute('data-agent-to-mode')||'floating';
    var panel=document.createElement('section');panel.className='agent-to-panel';
    var head=document.createElement('div');head.className='agent-to-head';
    var title=document.createElement('span');title.textContent=cfg.title||'دستیار هوشمند';head.appendChild(title);
    var close=null;if(mode==='floating'){close=document.createElement('button');close.className='agent-to-close';close.type='button';close.setAttribute('aria-label','بستن');close.textContent='×';head.appendChild(close);}
    var messages=document.createElement('div');messages.className='agent-to-messages';
    var form=document.createElement('form');form.className='agent-to-form';
    var input=document.createElement('input');input.className='agent-to-input';input.type='text';input.maxLength=2000;input.placeholder='پیامت را بنویس…';input.setAttribute('aria-label','پیام شما');input.required=true;
    var send=document.createElement('button');send.className='agent-to-send';send.type='submit';send.textContent='ارسال';
    var error=document.createElement('div');error.className='agent-to-error';error.hidden=true;
    form.appendChild(input);form.appendChild(send);panel.appendChild(head);panel.appendChild(messages);panel.appendChild(error);panel.appendChild(form);
    function add(text,who){var el=document.createElement('div');el.className='agent-to-msg '+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;}
    add(cfg.welcome||'سلام! چطور می‌توانم کمکتان کنم؟','bot');
    if(mode==='floating'){var launch=document.createElement('button');launch.type='button';launch.className='agent-to-launch';launch.textContent=cfg.title||'گفت‌وگو با ما';launch.addEventListener('click',function(){panel.classList.add('is-open');launch.hidden=true;input.focus();});close.addEventListener('click',function(){panel.classList.remove('is-open');launch.hidden=false;});root.appendChild(panel);root.appendChild(launch);}else{root.appendChild(panel);}
    form.addEventListener('submit',async function(ev){
      ev.preventDefault();var text=input.value.trim();if(!text||send.disabled)return;
      add(text,'user');input.value='';error.hidden=true;send.disabled=true;send.textContent='…';var waiting=add('در حال دریافت پاسخ…','bot');
      try{
        var response=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,visitorId:visitorId()})});
        var data=await response.json().catch(function(){return {};});
        if(!response.ok)throw new Error(data.message||data.code||'ارسال پیام ناموفق بود.');
        var reply=replyText(data);if(!reply)throw new Error('پاسخ متنی از سرور دریافت نشد.');
        waiting.textContent=reply;
      }catch(e){waiting.remove();error.textContent=e.message||'ارتباط با سرور برقرار نشد.';error.hidden=false;}
      finally{send.disabled=false;send.textContent='ارسال';input.focus();}
    });
  }
  function boot(){document.querySelectorAll('.agent-to-root').forEach(init);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
JS;
    }
}

new Agent_To_WordPress_Plugin();

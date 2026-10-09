<?php
/**
 * Plugin Name: Agent-To AI Chat
 * Plugin URI: https://github.com/HosseinKhashaypour85/agent-to
 * Description: Connects a WordPress website to the Agent-To AI assistant using your Site ID.
 * Version: 1.0.0
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

    public function __construct() {
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('wp_footer', array($this, 'render_floating_widget'));
        add_shortcode('agent_to_chat', array($this, 'shortcode'));
    }

    private function settings() {
        $defaults = array(
            'site_id' => '',
            'api_url' => 'https://agent-to.darkube.ir/api/v1',
            'widget_title' => 'دستیار هوشمند',
            'welcome_message' => 'سلام! چطور می‌توانم کمکتان کنم؟',
            'primary_color' => '#10706B',
            'enabled' => '1',
        );
        $saved = get_option(self::OPTION, array());
        return wp_parse_args(is_array($saved) ? $saved : array(), $defaults);
    }

    public function admin_menu() {
        add_options_page(
            'تنظیمات Agent-To',
            'Agent-To AI',
            'manage_options',
            'agent-to',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting('agent_to_wp_group', self::OPTION, array($this, 'sanitize_settings'));
    }

    public function sanitize_settings($input) {
        $input = is_array($input) ? $input : array();
        $current = $this->settings();
        $site_id = isset($input['site_id']) ? sanitize_text_field($input['site_id']) : '';
        $api_url = isset($input['api_url']) ? esc_url_raw(trim($input['api_url'])) : $current['api_url'];
        $api_url = untrailingslashit($api_url);
        if (!$api_url || !wp_http_validate_url($api_url) || !preg_match('#^https?://#i', $api_url)) {
            add_settings_error(self::OPTION, 'invalid_api_url', 'آدرس API معتبر نیست.');
            $api_url = $current['api_url'];
        }
        $color = isset($input['primary_color']) ? sanitize_hex_color($input['primary_color']) : $current['primary_color'];
        return array(
            'site_id' => $site_id,
            'api_url' => $api_url,
            'widget_title' => isset($input['widget_title']) ? sanitize_text_field($input['widget_title']) : $current['widget_title'],
            'welcome_message' => isset($input['welcome_message']) ? sanitize_textarea_field($input['welcome_message']) : $current['welcome_message'],
            'primary_color' => $color ?: '#10706B',
            'enabled' => !empty($input['enabled']) ? '1' : '0',
        );
    }

    public function settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        $s = $this->settings();
        ?>
        <div class="wrap">
          <h1>Agent-To AI Chat</h1>
          <p>برای اتصال این سایت، ابتدا در پنل Agent-To یک سایت بسازید و مقدار <code>siteId</code> آن را اینجا وارد کنید. این افزونه برای گفت‌وگو از مسیر عمومی <code>/api/v1/chat</code> استفاده می‌کند.</p>
          <?php settings_errors(self::OPTION); ?>
          <form method="post" action="options.php">
            <?php settings_fields('agent_to_wp_group'); ?>
            <table class="form-table" role="presentation">
              <tr><th scope="row"><label for="agent-to-site-id">Site ID</label></th><td><input id="agent-to-site-id" name="<?php echo esc_attr(self::OPTION); ?>[site_id]" type="text" class="regular-text" value="<?php echo esc_attr($s['site_id']); ?>" required><p class="description">شناسه سایت در پنل Agent-To؛ نه ایمیل و نه توکن نصب.</p></td></tr>
              <tr><th scope="row"><label for="agent-to-api-url">API Base URL</label></th><td><input id="agent-to-api-url" name="<?php echo esc_attr(self::OPTION); ?>[api_url]" type="url" class="regular-text" value="<?php echo esc_attr($s['api_url']); ?>" required><p class="description">پیش‌فرض: https://agent-to.darkube.ir/api/v1</p></td></tr>
              <tr><th scope="row"><label for="agent-to-title">عنوان ویجت</label></th><td><input id="agent-to-title" name="<?php echo esc_attr(self::OPTION); ?>[widget_title]" type="text" class="regular-text" value="<?php echo esc_attr($s['widget_title']); ?>"></td></tr>
              <tr><th scope="row"><label for="agent-to-welcome">پیام خوشامد</label></th><td><textarea id="agent-to-welcome" name="<?php echo esc_attr(self::OPTION); ?>[welcome_message]" rows="3" class="large-text"><?php echo esc_textarea($s['welcome_message']); ?></textarea></td></tr>
              <tr><th scope="row"><label for="agent-to-color">رنگ اصلی</label></th><td><input id="agent-to-color" name="<?php echo esc_attr(self::OPTION); ?>[primary_color]" type="color" value="<?php echo esc_attr($s['primary_color']); ?>"></td></tr>
              <tr><th scope="row">فعال‌سازی</th><td><label><input name="<?php echo esc_attr(self::OPTION); ?>[enabled]" type="checkbox" value="1" <?php checked($s['enabled'], '1'); ?>> نمایش ویجت شناور در سایت</label></td></tr>
            </table>
            <?php submit_button('ذخیره تنظیمات'); ?>
          </form>
          <hr>
          <h2>قرار دادن چت در یک صفحه مشخص</h2>
          <p>این شورت‌کد را در برگه یا نوشته قرار دهید:</p>
          <p><code>[agent_to_chat]</code></p>
          <h2>بررسی اتصال</h2>
          <p>بعد از ذخیره تنظیمات، ویجت را در سایت باز کنید و یک پیام آزمایشی بفرستید. اگر پاسخ خطا گرفتید، ابتدا Site ID و فعال بودن ایجنت و کانال سایت را در پنل بررسی کنید.</p>
        </div>
        <?php
    }

    public function register_rest_routes() {
        register_rest_route(self::REST_NAMESPACE, '/chat', array(
            'methods' => 'POST',
            'callback' => array($this, 'proxy_chat'),
            'permission_callback' => '__return_true',
            'args' => array(
                'message' => array('required' => true, 'type' => 'string'),
                'visitorId' => array('required' => true, 'type' => 'string'),
            ),
        ));
    }

    public function proxy_chat(WP_REST_Request $request) {
        $s = $this->settings();
        if (empty($s['site_id'])) {
            return new WP_Error('agent_to_not_configured', 'ابتدا Site ID افزونه را در تنظیمات وارد کنید.', array('status' => 503));
        }

        $message = sanitize_textarea_field((string) $request->get_param('message'));
        $visitor_id = sanitize_text_field((string) $request->get_param('visitorId'));
        if ($message === '' || mb_strlen($message) > 2000) {
            return new WP_Error('agent_to_invalid_message', 'پیام خالی است یا بیش از ۲۰۰۰ کاراکتر دارد.', array('status' => 400));
        }
        if ($visitor_id === '' || strlen($visitor_id) > 100) {
            return new WP_Error('agent_to_invalid_visitor', 'شناسه بازدیدکننده معتبر نیست.', array('status' => 400));
        }

        // Basic per-IP rate limit to reduce accidental abuse during load tests.
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $rate_key = 'agent_to_rate_' . md5($ip);
        $hits = (int) get_transient($rate_key);
        if ($hits >= 40) {
            return new WP_Error('agent_to_rate_limited', 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.', array('status' => 429));
        }
        set_transient($rate_key, $hits + 1, MINUTE_IN_SECONDS);

        $payload = array(
            'siteId' => $s['site_id'],
            'visitorId' => $visitor_id,
            'message' => $message,
            'channel' => 'WEBSITE',
        );
        $response = wp_remote_post($s['api_url'] . '/chat', array(
            'timeout' => 45,
            'headers' => array('Content-Type' => 'application/json', 'Accept' => 'application/json'),
            'body' => wp_json_encode($payload),
        ));

        if (is_wp_error($response)) {
            return new WP_Error('agent_to_api_unreachable', 'ارتباط با سرور Agent-To برقرار نشد. لطفاً دوباره تلاش کنید.', array('status' => 502));
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($status < 200 || $status >= 300) {
            $message_text = is_array($body) && !empty($body['message']) ? sanitize_text_field($body['message']) : 'درخواست به سرویس هوش مصنوعی ناموفق بود.';
            return new WP_Error('agent_to_upstream_error', $message_text, array('status' => $status >= 400 && $status <= 599 ? $status : 502));
        }
        if (!is_array($body)) {
            return new WP_Error('agent_to_invalid_response', 'پاسخ سرور قابل پردازش نیست.', array('status' => 502));
        }

        return rest_ensure_response($body);
    }

    public function register_assets() {
        wp_register_style('agent-to-widget', false, array(), '1.0.0');
        wp_enqueue_style('agent-to-widget');
        wp_add_inline_style('agent-to-widget', $this->css());
        wp_register_script('agent-to-widget', false, array(), '1.0.0', true);
        wp_enqueue_script('agent-to-widget');
        wp_add_inline_script('agent-to-widget', 'window.AgentToConfig = ' . wp_json_encode(array(
            'endpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/chat')),
            'title' => $this->settings()['widget_title'],
            'welcome' => $this->settings()['welcome_message'],
            'color' => $this->settings()['primary_color'],
            'enabled' => $this->settings()['enabled'] === '1',
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

    public function shortcode($atts = array()) {
        if (empty($this->settings()['site_id'])) {
            return current_user_can('manage_options') ? '<p>Agent-To: لطفاً Site ID را در تنظیمات افزونه وارد کنید.</p>' : '';
        }
        return $this->widget_markup('embedded');
    }

    private function widget_markup($mode) {
        static $count = 0;
        $count++;
        $id = 'agent-to-widget-' . $count;
        return '<div class="agent-to-root agent-to-' . esc_attr($mode) . '" id="' . esc_attr($id) . '" data-agent-to-mode="' . esc_attr($mode) . '"></div>';
    }

    private function css() {
        return '
.agent-to-root{font-family:inherit;direction:rtl;z-index:999999;color:#1f2937}.agent-to-floating{position:fixed;bottom:22px;right:22px}.agent-to-launch{border:0;border-radius:999px;background:var(--agent-to-color,#10706B);color:#fff;padding:14px 20px;font-size:15px;font-weight:700;box-shadow:0 8px 28px #0002;cursor:pointer}.agent-to-panel{display:none;width:min(360px,calc(100vw - 28px));height:470px;max-height:70vh;background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 16px 60px #0002;overflow:hidden;margin-bottom:12px;flex-direction:column}.agent-to-panel.is-open{display:flex}.agent-to-embedded .agent-to-panel{display:flex;width:100%;height:520px;max-height:75vh;margin:0}.agent-to-head{background:var(--agent-to-color,#10706B);color:#fff;padding:15px;display:flex;align-items:center;justify-content:space-between;font-weight:700}.agent-to-close{background:transparent;color:#fff;border:0;font-size:24px;cursor:pointer}.agent-to-messages{padding:14px;flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;background:#f8fafc}.agent-to-msg{white-space:pre-wrap;overflow-wrap:anywhere;max-width:88%;padding:10px 12px;border-radius:14px;line-height:1.65;font-size:14px}.agent-to-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e5e7eb}.agent-to-msg.user{align-self:flex-end;background:var(--agent-to-color,#10706B);color:#fff}.agent-to-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff}.agent-to-input{min-width:0;flex:1;border:1px solid #d1d5db;border-radius:12px;padding:10px;font:inherit;font-size:14px}.agent-to-send{border:0;border-radius:12px;background:var(--agent-to-color,#10706B);color:#fff;padding:0 15px;cursor:pointer}.agent-to-send:disabled{opacity:.55;cursor:wait}.agent-to-error{font-size:12px;color:#b91c1c;padding:0 12px 8px}.agent-to-root *{box-sizing:border-box}
        ';
    }

    private function javascript() {
        return <<<'JS'
(function(){
  if (!window.AgentToConfig) return;
  var cfg = window.AgentToConfig;
  function makeId(){ return 'v_' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now()); }
  function visitorId(){ try { var id = localStorage.getItem('agent_to_visitor_id'); if(!id){id=makeId();localStorage.setItem('agent_to_visitor_id',id);} return id; } catch(e){ return makeId(); } }
  function pickReply(data){
    if(!data) return '';
    var candidates = [data.reply, data.answer, data.response, data.message, data.data && data.data.reply, data.data && data.data.answer, data.data && data.data.response, data.data && data.data.message];
    for(var i=0;i<candidates.length;i++){ if(typeof candidates[i] === 'string' && candidates[i].trim()) return candidates[i].trim(); }
    return '';
  }
  function init(root){
    if(root.dataset.ready) return; root.dataset.ready='1';
    root.style.setProperty('--agent-to-color', cfg.color || '#10706B');
    var mode = root.getAttribute('data-agent-to-mode') || 'floating';
    var panel = document.createElement('section'); panel.className='agent-to-panel';
    var head=document.createElement('div'); head.className='agent-to-head';
    var title=document.createElement('span'); title.textContent=cfg.title || 'دستیار هوشمند'; head.appendChild(title);
    if(mode==='floating'){ var close=document.createElement('button'); close.className='agent-to-close'; close.type='button'; close.setAttribute('aria-label','بستن'); close.textContent='×'; head.appendChild(close); }
    var messages=document.createElement('div'); messages.className='agent-to-messages';
    var form=document.createElement('form'); form.className='agent-to-form';
    var input=document.createElement('input'); input.className='agent-to-input'; input.type='text'; input.maxLength=2000; input.placeholder='پیامتان را بنویسید…'; input.setAttribute('aria-label','پیام شما'); input.required=true;
    var send=document.createElement('button'); send.className='agent-to-send'; send.type='submit'; send.textContent='ارسال';
    var error=document.createElement('div'); error.className='agent-to-error'; error.hidden=true;
    form.appendChild(input);form.appendChild(send);panel.appendChild(head);panel.appendChild(messages);panel.appendChild(error);panel.appendChild(form);
    function addMessage(text,who){var item=document.createElement('div');item.className='agent-to-msg '+who;item.textContent=text;messages.appendChild(item);messages.scrollTop=messages.scrollHeight;return item;}
    addMessage(cfg.welcome || 'سلام! چطور می‌توانم کمکتان کنم؟','bot');
    if(mode==='floating'){
      var launch=document.createElement('button');launch.type='button';launch.className='agent-to-launch';launch.textContent=cfg.title || 'گفت‌وگو با ما';
      launch.addEventListener('click',function(){panel.classList.add('is-open');launch.hidden=true;input.focus();});
      var closeButton=head.querySelector('.agent-to-close');closeButton.addEventListener('click',function(){panel.classList.remove('is-open');launch.hidden=false;});
      root.appendChild(panel);root.appendChild(launch);
    } else {root.appendChild(panel);}
    form.addEventListener('submit',async function(ev){
      ev.preventDefault(); var text=input.value.trim();if(!text || send.disabled)return;
      addMessage(text,'user');input.value='';error.hidden=true;send.disabled=true;send.textContent='…';
      var waiting=addMessage('در حال دریافت پاسخ…','bot');
      try{
        var response=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,visitorId:visitorId()})});
        var data=await response.json().catch(function(){return {};});
        if(!response.ok) throw new Error((data && (data.message || data.code)) || 'ارسال پیام ناموفق بود.');
        var reply=pickReply(data);
        if(!reply) reply='پیام دریافت شد، اما پاسخ متنی در خروجی API پیدا نشد. پاسخ خام: '+JSON.stringify(data).slice(0,500);
        waiting.textContent=reply;
      }catch(e){waiting.remove();error.textContent=e.message || 'ارتباط با سرور برقرار نشد.';error.hidden=false;}
      finally{send.disabled=false;send.textContent='ارسال';input.focus();}
    });
  }
  function boot(){document.querySelectorAll('.agent-to-root').forEach(init);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
JS;
    }
}

new Agent_To_WordPress_Plugin();

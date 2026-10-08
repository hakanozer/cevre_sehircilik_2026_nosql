const fs = require("node:fs");
const path = require("node:path");

const outDir = path.resolve(__dirname, "..");

const diagrams = {
  single: `<figure class="diagram"><figcaption>Tek instance: istemci, Redis belleği ve persistence katmanı</figcaption><svg viewBox="0 0 800 180" role="img" aria-labelledby="single-title"><title id="single-title">Uygulama Redis sunucusuna bağlanır; Redis belleği ve RDB/AOF diski</title><defs><marker id="arrow-single" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#1264a3"/></marker></defs><rect x="20" y="55" width="170" height="70" rx="12" fill="#eaf3fb" stroke="#1264a3"/><text x="105" y="84" text-anchor="middle">Uygulama / client</text><text x="105" y="106" text-anchor="middle">TCP bağlantısı</text><rect x="300" y="35" width="220" height="110" rx="12" fill="#eaf7f6" stroke="#087e8b"/><text x="410" y="72" text-anchor="middle">Redis instance</text><text x="410" y="97" text-anchor="middle">Key → tipli value</text><text x="410" y="120" text-anchor="middle">Bellek içi erişim</text><rect x="630" y="55" width="150" height="70" rx="12" fill="#fff5e4" stroke="#a45b00"/><text x="705" y="84" text-anchor="middle">RDB / AOF</text><text x="705" y="106" text-anchor="middle">Disk / volume</text><line x1="190" y1="90" x2="290" y2="90" stroke="#1264a3" stroke-width="3" marker-end="url(#arrow-single)"/><line x1="520" y1="90" x2="620" y2="90" stroke="#a45b00" stroke-width="3" marker-end="url(#arrow-single)"/></svg></figure>`,
  ha: `<figure class="diagram"><figcaption>Replikasyon ve Sentinel: kopyalama, izleme ve failover ayrı sorumluluklardır</figcaption><svg viewBox="0 0 900 240" role="img" aria-labelledby="ha-title"><title id="ha-title">Client primary ye bağlanır, replica veriyi çoğaltır, üç Sentinel primary sağlığını izler</title><defs><marker id="arrow-ha" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#1264a3"/></marker></defs><rect x="25" y="80" width="150" height="60" rx="10" fill="#eaf3fb" stroke="#1264a3"/><text x="100" y="115" text-anchor="middle">Uygulama client</text><rect x="280" y="55" width="190" height="75" rx="10" fill="#eaf7f6" stroke="#087e8b"/><text x="375" y="86" text-anchor="middle">Primary</text><text x="375" y="110" text-anchor="middle">read / write</text><rect x="600" y="55" width="190" height="75" rx="10" fill="#f4effa" stroke="#7046a1"/><text x="695" y="86" text-anchor="middle">Replica</text><text x="695" y="110" text-anchor="middle">asenkron kopya</text><line x1="175" y1="110" x2="270" y2="95" stroke="#1264a3" stroke-width="3" marker-end="url(#arrow-ha)"/><line x1="470" y1="94" x2="590" y2="94" stroke="#087e8b" stroke-width="3" marker-end="url(#arrow-ha)"/><text x="530" y="82" text-anchor="middle">replication</text><rect x="280" y="175" width="120" height="42" rx="9" fill="#fff5e4" stroke="#a45b00"/><rect x="430" y="175" width="120" height="42" rx="9" fill="#fff5e4" stroke="#a45b00"/><rect x="580" y="175" width="120" height="42" rx="9" fill="#fff5e4" stroke="#a45b00"/><text x="340" y="201" text-anchor="middle">Sentinel 1</text><text x="490" y="201" text-anchor="middle">Sentinel 2</text><text x="640" y="201" text-anchor="middle">Sentinel 3</text><line x1="340" y1="175" x2="360" y2="135" stroke="#a45b00" stroke-dasharray="5 4"/><line x1="490" y1="175" x2="390" y2="135" stroke="#a45b00" stroke-dasharray="5 4"/><line x1="640" y1="175" x2="410" y2="135" stroke="#a45b00" stroke-dasharray="5 4"/></svg></figure><figure class="diagram"><figcaption>Cluster: hash slot\'ları farklı master node'lara, replica'lar ise failover kopyalarına dağılır</figcaption><svg viewBox="0 0 900 175" role="img" aria-labelledby="cluster-title"><title id="cluster-title">Cluster client MOVED yönlendirmesiyle üç slot master\'ından birine gider; her master\'ın replica\'sı bulunur</title><defs><marker id="arrow-cluster" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#1264a3"/></marker></defs><rect x="20" y="52" width="150" height="65" rx="10" fill="#eaf3fb" stroke="#1264a3"/><text x="95" y="90" text-anchor="middle">Cluster client</text><line x1="170" y1="84" x2="235" y2="84" stroke="#1264a3" stroke-width="3" marker-end="url(#arrow-cluster)"/><rect x="250" y="25" width="180" height="55" rx="9" fill="#eaf7f6" stroke="#087e8b"/><text x="340" y="49" text-anchor="middle">Master A · slots</text><text x="340" y="68" text-anchor="middle">0–5460</text><rect x="250" y="105" width="180" height="48" rx="9" fill="#f4effa" stroke="#7046a1"/><text x="340" y="135" text-anchor="middle">Replica A</text><rect x="500" y="25" width="180" height="55" rx="9" fill="#eaf7f6" stroke="#087e8b"/><text x="590" y="49" text-anchor="middle">Master B · slots</text><text x="590" y="68" text-anchor="middle">5461–10922</text><rect x="500" y="105" width="180" height="48" rx="9" fill="#f4effa" stroke="#7046a1"/><text x="590" y="135" text-anchor="middle">Replica B</text><rect x="730" y="25" width="150" height="55" rx="9" fill="#eaf7f6" stroke="#087e8b"/><text x="805" y="49" text-anchor="middle">Master C</text><text x="805" y="68" text-anchor="middle">remaining slots</text><line x1="340" y1="80" x2="340" y2="98" stroke="#7046a1" stroke-dasharray="4 3"/><line x1="590" y1="80" x2="590" y2="98" stroke="#7046a1" stroke-dasharray="4 3"/></svg></figure>`,
  cache: `<figure class="diagram"><figcaption>Cache-aside: hit doğrudan yanıtlanır, miss kaynak DB okunup cache doldurulur</figcaption><svg viewBox="0 0 900 190" role="img" aria-labelledby="cache-title"><title id="cache-title">Uygulama önce Redis cache e bakar; miss durumunda DB yi okuyup cache e yazar</title><defs><marker id="arrow-cache" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#1264a3"/></marker></defs><rect x="20" y="60" width="155" height="65" rx="10" fill="#eaf3fb" stroke="#1264a3"/><text x="97" y="98" text-anchor="middle">Uygulama</text><rect x="285" y="25" width="180" height="60" rx="10" fill="#eaf7f6" stroke="#087e8b"/><text x="375" y="61" text-anchor="middle">Redis cache</text><rect x="600" y="105" width="180" height="60" rx="10" fill="#fff5e4" stroke="#a45b00"/><text x="690" y="141" text-anchor="middle">Kaynak DB</text><line x1="175" y1="80" x2="275" y2="62" stroke="#1264a3" stroke-width="3" marker-end="url(#arrow-cache)"/><text x="222" y="55" text-anchor="middle">GET</text><line x1="285" y1="75" x2="180" y2="115" stroke="#087e8b" stroke-width="2" marker-end="url(#arrow-cache)"/><text x="226" y="112" text-anchor="middle">hit → yanıt</text><line x1="440" y1="85" x2="600" y2="120" stroke="#a45b00" stroke-width="2" marker-end="url(#arrow-cache)"/><text x="520" y="94" text-anchor="middle">miss → SELECT</text><line x1="600" y1="155" x2="465" y2="78" stroke="#a45b00" stroke-width="2" marker-end="url(#arrow-cache)"/><text x="530" y="158" text-anchor="middle">SET EX TTL</text></svg></figure>`,
  messaging: `<figure class="diagram"><figcaption>Pub/Sub online subscriber\'lara anlık yayın yapar; Stream kayıtları consumer group için saklar</figcaption><svg viewBox="0 0 900 190" role="img" aria-labelledby="messaging-title"><title id="messaging-title">Pub/Sub channel anlık fan-out; Stream append-only kayıt, consumer group ve acknowledgment</title><defs><marker id="arrow-msg" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#1264a3"/></marker></defs><text x="20" y="25" font-weight="bold">Pub/Sub · backlog yok</text><rect x="20" y="45" width="135" height="50" rx="9" fill="#eaf3fb" stroke="#1264a3"/><text x="87" y="76" text-anchor="middle">Publisher</text><rect x="285" y="45" width="145" height="50" rx="9" fill="#eaf7f6" stroke="#087e8b"/><text x="357" y="76" text-anchor="middle">Channel</text><rect x="570" y="25" width="150" height="45" rx="9" fill="#f4effa" stroke="#7046a1"/><text x="645" y="53" text-anchor="middle">Subscriber A</text><rect x="570" y="82" width="150" height="45" rx="9" fill="#f4effa" stroke="#7046a1"/><text x="645" y="110" text-anchor="middle">Subscriber B</text><line x1="155" y1="70" x2="275" y2="70" stroke="#1264a3" stroke-width="2" marker-end="url(#arrow-msg)"/><line x1="430" y1="65" x2="560" y2="50" stroke="#1264a3" stroke-width="2" marker-end="url(#arrow-msg)"/><line x1="430" y1="78" x2="560" y2="100" stroke="#1264a3" stroke-width="2" marker-end="url(#arrow-msg)"/><text x="20" y="158" font-weight="bold">Streams · kayıt + ack</text><rect x="285" y="138" width="200" height="42" rx="8" fill="#fff5e4" stroke="#a45b00"/><text x="385" y="165" text-anchor="middle">Stream event log</text><rect x="570" y="138" width="210" height="42" rx="8" fill="#eaf7f6" stroke="#087e8b"/><text x="675" y="165" text-anchor="middle">Consumer group → XACK</text><line x1="485" y1="159" x2="560" y2="159" stroke="#a45b00" stroke-width="2" marker-end="url(#arrow-msg)"/></svg></figure>`,
};

const pages = [
  {
    n: 1, file: "01-yol-haritasi.html", title: "Eğitim Yol Haritası + Ön Gereksinimler", short: "Yol haritası",
    duration: "45–60 dk", level: "Başlangıç + Uzman",
    goals: ["13 oturumun sırasını ve çıktısını açıklamak", "Windows/macOS üzerinde Docker, Python ve VS Code hazırlığını doğrulamak", "Ortak lab klasör yapısını oluşturmak", "Eğitim boyunca kullanılacak araçları güvenli biçimde çalıştırmak"],
    prereq: "Yönetici yetkili bir bilgisayar, internet erişimi (yalnızca ilk kurulum ve imaj indirme için), boş disk alanı ve Docker Desktop kurulumuna izin. Kurumsal proxy/EDR varsa önceden BT ekibine başvurun.",
    opening: "“Bugün Redis’e geçmeden önce herkesin aynı, tekrarlanabilir laboratuvar ortamında olmasını sağlayacağız. Redis’i işletim sisteminize doğrudan kurmuyoruz; Docker ile sürümü ve yapılandırmayı sınıf genelinde eşitliyoruz.”",
    questions: ["Bir servisi kendi bilgisayarınıza kurmakla konteynerde çalıştırmak arasında hangi farklar var?", "Redis durursa verinin ne olmasını beklersiniz?", "İş bilgisayarınızda sanallaştırma veya kurumsal izin kısıtı var mı?"],
    traps: "Docker Desktop kurulmuş olsa da çalışmıyor olabilir; ilk açılış/izin adımlarını bekleyin. Windows'ta PowerShell ile WSL2 terminalini, macOS'ta Intel ile Apple Silicon imajını karıştırmayın. Şirket cihazlarında yönetici izni ve proxy gereksinimini önceden doğrulayın.",
    why: "Kurulum farklılıkları, eğitimde karşılaşılan hataların önemli bölümünü oluşturur. Docker aynı Redis sürümünü, port eşlemesini ve yapılandırmayı tüm katılımcılara sağlar; ana işletim sistemini kirletmez ve lab sonunda konteyneri kaldırmayı kolaylaştırır. Bu eğitimde üretim güvenliği için Redis portunu tüm ağa açmayacağız.",
    what: "Docker Desktop, Docker Engine’i masaüstü ortamında yönetir. Compose birden fazla servisi YAML ile tanımlar. Python, Redis’e redis-py istemcisiyle bağlanır. VS Code dosya düzenleme ve çalıştırma için kullanılır. RedisInsight isteğe bağlı görsel inceleme aracıdır; komut satırı becerisinin yerine geçmez.",
    how: "Kontrol sırası: donanım sanallaştırması → Docker Desktop → terminalde Docker doğrulaması → Python ve sanal ortam → VS Code eklentisi → Redis konteyneri → PING/PONG. Windows 10/11 için desteklenen sürümü ve WSL2 gereksinimini kurulum anında Docker Desktop’ın güncel resmi gereksinimlerinden doğrulayın. macOS'ta Apple Silicon (arm64) veya Intel (x86_64) işlemcinize uygun paketi indirin.",
    expert: "Eğitim imajı için `redis:<major.minor.patch>` biçiminde sabit sürüm seçin; sınıf öncesi Docker Hub/resmi Redis sayfasından desteklenen güncel yamayı doğrulayın, `latest` kullanmayın. Apple Silicon’da çoklu mimari imajlar çoğunlukla emülasyonsuz çalışır; imaj manifestini doğrulayın, emülasyon performansını gerçek üretim performansı sanmayın. Kurumsal cihazlarda Docker Desktop lisansı/BT politikası ayrıca kontrol edilmelidir.",
    lab: `
      <h3>1. Donanım ve işletim sistemi ön kontrolü</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows 10/11 · Görev Yöneticisi</b> → <b>Performance</b> → <b>CPU</b> bölümünde <b>Virtualization: Enabled</b> değerini doğrulayın. Kapalıysa BIOS/UEFI’de Intel VT-x/AMD-V ayarını BT/cihaz üreticisinin yönergesiyle etkinleştirin; BIOS değişikliğini izinsiz yapmayın.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows 10/11 · PowerShell'i yönetici olarak açın</b> (Start → “PowerShell” ara → sağ tık → <b>Run as administrator</b>) ve WSL2 bileşenini kurun. Bu tek komut yönetici yetkisi ister.</label><pre><code>wsl --install</code></pre><p>Yeni Windows kurulumlarında varsayılan dağıtımı da kurabilir ve yeniden başlatma isteyebilir. Yönergeyi tamamlayın, bilgisayarı yeniden başlatın. Kurumsal politikada izin yoksa BT'ye başvurun.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows 10/11 · PowerShell</b> açın (Start → PowerShell; yönetici gerekmez) ve WSL durumunu doğrulayın.</label><pre><code>wsl --status</code></pre><p>WSL durum ve varsayılan sürüm bilgisi yazdırılır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows 10/11 · PowerShell</b>: kurulu dağıtımların WSL sürümünü kontrol edin.</label><pre><code>wsl --list --verbose</code></pre><p>Dağıtım satırındaki VERSION değeri 2 olmalı. Gerekirse <code>wsl --set-default-version 2</code> komutunu ayrı çalıştırın. Eski Windows sürümlerinde <code>wsl --install</code> desteklenmiyorsa resmi WSL yönergesini ve Windows Update durumunu kontrol edin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>macOS · Apple menu → About This Mac</b> ekranında Chip (Apple Silicon) veya Processor (Intel) değerini not edin. Apple Silicon için arm64, Intel için x86_64 Docker Desktop indirmesini seçin.</label></div>
      <div class="step"><label><input type="checkbox"> <b>macOS · Terminal'i açın</b>: Finder → Applications → Utilities → <b>Terminal</b> veya Spotlight (⌘+Space) → “Terminal”. Mimariyi kontrol edin.</label><pre><code>uname -m</code></pre><p><code>arm64</code> Apple Silicon, <code>x86_64</code> Intel anlamına gelir. Beklenen çıktı bilgisayarınıza göre bu iki değerden biridir.</p></div>
      <h3>2. Docker Desktop kurulumu ve doğrulaması</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Tarayıcı</b>: Docker Desktop'ın resmi indirme sayfasında işletim sistemi ve macOS mimarinize uygun güncel kararlı yükleyiciyi indirin. Windows için WSL 2 backend seçeneğini işaretleyin. Sürümü eğitim boyunca sabitleyin; indirme sayfasındaki sürüm numarasını not edin.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Yükleyici</b>: indirilen Docker Desktop yükleyicisini açın, ekrandaki varsayılan adımları uygulayın. macOS güvenlik/izin penceresinde yalnızca Docker Desktop yüklemesini onaylayın; yönetici parolası istenebilir.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows · Docker Desktop</b> → <b>Settings (dişli ikonu) → General</b> bölümünde WSL 2 based engine seçili olduğunu doğrulayın. Gerekirse <b>Apply & restart</b> seçin. Ardından <b>Settings → Resources → WSL Integration</b> altında kullandığınız dağıtımı etkinleştirin. Arayüz sürümü değişebilir; seçenek adını kurulu sürümde doğrulayın.</label></div>
      <div class="step"><label><input type="checkbox"> <b>macOS · Docker Desktop</b> uygulamasını Applications'tan açın ve ilk çalıştırma izinlerini onaylayın. Menü çubuğundaki Docker durumunun “Running” olduğunu bekleyin. Apple Silicon ve Intel'de aynı Docker CLI komutları kullanılır.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows · PowerShell</b> veya <b>macOS · Terminal</b> içinde CLI sürümlerini kontrol edin.</label><pre><code>docker --version
docker compose version</code></pre><p><code>Docker version ...</code> ve <code>Docker Compose version ...</code> benzeri iki satır beklenir. “Cannot connect to the Docker daemon” varsa Docker Desktop'ı başlatıp Running olmasını bekleyin.</p></div>
      <h3>3. Python, sanal ortam ve VS Code</h3>
      <div class="tabs">
        <button class="tab active" type="button" data-tab="win">Windows</button><button class="tab" type="button" data-tab="mac">macOS</button>
        <div class="tab-panel active" data-panel="win"><ol>
          <li><b>Windows · Tarayıcı</b>: python.org Windows indirme sayfasından desteklenen Python 3 sürümünün 64-bit installer'ını indirin. EOL sürüm seçmeyin; eğitimde kullanılacak minor sürümü sınıf öncesi sabitleyin.</li>
          <li><b>Windows · Python installer</b>: ilk ekranda <b>Add python.exe to PATH</b> kutusunu işaretleyin; sonra <b>Install Now</b> seçin. Tamamlanınca yeni PowerShell açın.</li>
          <li><b>Windows · PowerShell</b>: kurulum doğrulaması.</li>
        </ol><pre><code>py --version
py -m pip --version</code></pre><p>Python 3.x ve pip yolu görünmelidir. PATH yenilenmemişse yeni terminal açın; <code>py</code> yoksa installer'ı Modify/Repair ile PATH seçeneği açık olacak şekilde düzeltin.</p></div>
        <div class="tab-panel" data-panel="mac"><ol>
          <li><b>macOS · Tarayıcı</b>: python.org macOS indirme sayfasındaki güncel kararlı universal2 installer'ı seçin veya Homebrew kullanın. Eğitim boyunca tek bir yöntem ve Python minor sürümü kullanın.</li>
          <li><b>macOS · Terminal</b>: Homebrew zaten kuruluysa Python'ı yükleyin; Homebrew yoksa python.org installer'ını kullanın. Homebrew kurulumu kurumsal politikaya tabi olabilir.</li>
        </ol><pre><code>brew install python</code></pre><p><code>brew</code> bulunmuyorsa bu alternatif komutu çalıştırmayın; python.org installer'ını kullanın. Yükleyici yönergelerini ve macOS güvenlik onaylarını izleyin.</p><pre><code>python3 --version
python3 -m pip --version</code></pre><p>Python 3.x ve pip yolu beklenir. <code>command not found</code> durumunda yeni Terminal açın ve PATH'i kontrol edin.</p></div>
      </div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: VS Code'u resmi kaynaktan yükleyin. VS Code → <b>Extensions</b> (Ctrl+Shift+X / ⇧⌘X) → “Python” ara → Microsoft yayımlayıcılı <b>Python</b> eklentisi → <b>Install</b>.</label></div>
      <h3>4. Ortak lab klasörünü ve Compose dosyasını oluşturun</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b> → <b>File → Open Folder…</b> ile Home directory'yi açın (<code>%USERPROFILE%</code> / <code>~</code>) ve burada <code>redis-egitimi</code> klasörünü oluşturun.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code Explorer</b> → <code>redis-egitimi</code> → <b>New Folder</b> ile <code>docker</code> klasörünü oluşturun.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code Explorer</b> → <code>redis-egitimi</code> → <b>New Folder</b> ile <code>python</code> klasörünü oluşturun.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code Explorer</b> → <code>redis-egitimi</code> → <b>New Folder</b> ile <code>labs</code> klasörünü oluşturun.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b> → Explorer → <code>redis-egitimi/docker/</code> → <b>New File</b> → <code>compose.yaml</code>. Aşağıdaki tam içeriği kaydedin. Redis sürümünü sınıf öncesi resmi kaynaktan doğrulanmış sabit sürümle değiştirin; placeholder'ı çalıştırmadan önce değiştirin.</label><pre><code>services:
  redis:
    image: redis:&lt;major.minor.patch&gt;
    container_name: redis-lab
    command: [&quot;redis-server&quot;, &quot;--appendonly&quot;, &quot;yes&quot;]
    ports:
      - &quot;127.0.0.1:6379:6379&quot;
    volumes:
      - redis-data:/data
    restart: unless-stopped
volumes:
  redis-data:</code></pre><p><code>image</code> sabit imaj etiketi, <code>command</code> AOF'yi açar, host binding yalnızca yerel makineye erişim verir, volume veriyi konteyner ömründen bağımsız tutar. Placeholder gerçek sürüm olmadan Compose çalışmaz.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows · PowerShell</b>: Compose klasörüne geçin.</label><pre><code>cd $HOME\\redis-egitimi\\docker</code></pre><p><b>macOS · Terminal</b>:</p><pre><code>cd ~/redis-egitimi/docker</code></pre></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · PowerShell/Terminal</b>: Compose servisini başlatın.</label><pre><code>docker compose up -d</code></pre><p><code>up</code> servisleri oluşturup çalıştırır; <code>-d</code> arka planda çalıştırır. Beklenen: image pull tamamlanır ve konteyner başlar. Port doluysa 6379'u kullanan servisi belirleyin, Compose host portunu değiştirip istemci adresini de güncelleyin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows · PowerShell</b> veya <b>macOS · Terminal</b> ile container durumunu doğrulayın.</label><pre><code>docker ps</code></pre><p><code>redis-lab</code> satırında <code>Up</code> ve <code>127.0.0.1:6379-&gt;6379/tcp</code> beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Redis CLI ile sağlık kontrolü yapın.</label><pre><code>docker exec -it redis-lab redis-cli PING</code></pre><p><code>PONG</code> beklenir. <code>docker exec</code> çalışan konteynerde komut çalıştırır, <code>-it</code> terminal etkileşimini açar.</p></div>
      <div class="info"><b>Linux kısa notu:</b> Linux katılımcıları Docker Engine ve Compose plugin'i dağıtımın resmi paket kaynağından kurup aynı <code>docker compose</code> komutlarını kullanabilir. Python komutu çoğunlukla <code>python3</code>'tür. Redis'i host işletim sistemine kurmayın; eğitim Redis'i yine Docker konteynerinde çalıştırın. Kullanıcıyı Docker grubuna eklemenin root seviyesinde yetki verdiğini hesaba katın.</div>
      <div class="info"><b>İsteğe bağlı RedisInsight:</b> eğitim başlangıcında CLI'ı esas alın. RedisInsight kullanılacaksa uyumlu güncel sürümünü resmi kaynaktan doğrulayın, uygulamayı Docker Desktop'a ekleyin ve bağlantı adresini <code>localhost:6379</code> olarak tanımlayın. RedisInsight'ı aynı konteyner ağına bağlama yöntemi kurulum biçimine göre değişebilir; sınıf öncesinde test edin.</div>`,
    expected: "Docker CLI sürümleri yazdırılır, `docker ps` içinde `redis-lab` Up görünür ve `docker exec -it redis-lab redis-cli PING` çıktısı `PONG` olur. Python doğrulaması sisteminize göre Python 3.x ve pip yolunu gösterir.",
    errors: [
      ["Cannot connect to the Docker daemon", "Docker Desktop kapalı veya başlatılması tamamlanmamış.", "Docker Desktop'ı açın; Running durumunu bekleyin; CLI komutunu tekrarlayın."],
      ["Ports are not available: ... address already in use", "6379 host portunu başka servis kullanıyor.", "Servisi bulun veya compose.yaml'da host portunu 6380 yapın; bağlantıda 6380 kullanın."],
      ["Virtualization is disabled in the firmware", "BIOS/UEFI sanallaştırması kapalı veya kurumsal cihaz kısıtlı.", "Görev Yöneticisi'nde doğrulayın; yetkiniz varsa üretici yönergesi, yoksa BT desteği."],
      ["'docker' is not recognized as the name of a cmdlet", "Docker CLI PATH'te değil ya da Docker Desktop kurulumundan sonra terminal yenilenmedi.", "Docker Desktop kurulumunu doğrulayın, yeni PowerShell açın; PATH'i kurumsal IT ile kontrol edin."],
      ["'python' is not recognized ... / zsh: command not found: python3", "Python kurulu değil ya da PATH güncellenmemiş.", "Yeni terminal açın; Windows'ta `py --version`, macOS'ta `python3 --version` deneyin; installer/PATH'i onarın."],
      ["The term ... Activate.ps1 cannot be loaded because running scripts is disabled", "PowerShell ExecutionPolicy aktivasyon betiğini engelliyor.", "Yalnızca mevcut kullanıcı kapsamındaki `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` komutunu kullanın; şirket politikasını aşmayın."],
    ],
    easy: "Docker ile Redis çalıştırmanın iki avantajını söyleyin.", ea: "Sabit ve izole ortam; kolay başlatma/kaldırma ve ana işletim sistemine paket kurmama.",
    medium: "Apple Silicon'da `uname -m` çıktısı `arm64`. Hangi Docker Desktop paketi seçilir?", ma: "Apple Silicon / arm64 paketi.",
    hard: "6379 meşgul; host portunu 6380 yaptınız. CLI doğrulamasını nasıl değiştirirsiniz?", ha: "Compose port eşlemesi `127.0.0.1:6380:6379`; `docker exec ... redis-cli PING` porttan bağımsız çalışır. Host istemcisi için `localhost:6380` kullanılır.",
    checklist: ["Docker Desktop çalışıyor ve Docker CLI yanıt veriyor", "Python ve pip sürümleri doğrulandı", "VS Code Python eklentisi kuruldu", "redis-egitimi klasör yapısı ve compose.yaml hazır", "Redis konteynerinden PONG alındı"],
  },
  {
    n: 2, file: "02-redis-temelleri.html", title: "Redis Basics", short: "Redis Basics",
    duration: "50 dk", level: "Başlangıç → Orta",
    goals: ["Redis'in veri modeli ve bellek tabanlı çalışma biçimini açıklamak", "Uygun ve uygunsuz kullanım alanlarını ayırt etmek", "RDBMS, belge veritabanı ve Redis'in rolünü kıyaslamak", "Tek iş parçacıklı komut yürütmenin etkisini değerlendirmek"],
    prereq: "01. sayfadaki Docker doğrulaması tamamlanmış olmalı; Redis `redis-lab` konteyneri çalışmalı.",
    opening: "“Redis’i ‘her şeyi hızlandıran bir veritabanı’ gibi değil, belli erişim örüntülerini çok verimli çözen bir veri sunucusu olarak ele alalım. Önce hangi problemi çözdüğünü, sonra neyi çözmediğini netleştirelim.”",
    questions: ["Bir katalog ürününü her istekte ana veritabanından okumak zorunda mıyız?", "Bellekte tutulan her veri kalıcı mıdır?", "Yavaş bir Redis komutunda daha fazla CPU çekirdeği neden çözüm olmayabilir?"],
    traps: "“In-memory = kalıcılık yok” ve “single-thread = Redis tek çekirdek kullanır” genellemelerini düzeltin. Komut yürütme modeli ile I/O, arka plan işleri ve modern sürümlerdeki ek iş parçacıklarını birbirinden ayırın.",
    why: "Bir e-ticaret kataloğunda popüler ürünler her saniye binlerce kez okunabilir. Bu okumaları doğrudan ilişkisel veritabanına göndermek maliyet ve gecikme yaratır. Redis bu tür düşük gecikmeli, bellek içi erişimler için güçlüdür; ancak kalıcı kayıtların doğruluk kaynağı çoğu zaman hâlâ ana veritabanıdır.",
    what: "Redis, anahtar-değer erişimini farklı veri yapılarıyla birleştiren, ağ üzerinden komut alan bir veri sunucusudur. String yanında Hash, List, Set, Sorted Set ve Stream gibi tipler sunar. Veriler bellekte tutulur; RDB snapshot ve AOF komut günlüğü ile diske yazma seçenekleri vardır. Redis ilişkisel sorgu motoru değildir: SQL join ve keyfi çok tablolı sorgu beklentisi uygun değildir.",
    how: "İstemci TCP bağlantısı üzerinden komut gönderir; Redis anahtarın tipine uygun işlemi uygular ve yanıt döndürür. Temel komut yürütmesi tek bir ana iş parçacığı etrafında serileştirilir; bu, atomiklik ve düşük kilitleme maliyeti sağlar. Buna karşılık uzun/CPU yoğun komutlar diğer istemcileri bekletebilir. Ağ, disk, istemci havuzu ve işletim sistemi de gerçek gecikmeyi etkiler.",
    diagram: diagrams.single,
    expert: "Redis'i ana veritabanı yerine koyma kararı veri kaybı toleransı, persistence, backup/restore, bellek maliyeti ve veri modeliyle birlikte değerlendirilir. `KEYS *`, büyük `SORT`, çok geniş `LRANGE` gibi pahalı işler ana event loop'u geciktirebilir. “Komut O(1)” ifadesi sabit veri boyutu varsayımını taşır; büyük değer/yanıt, ağ aktarımı ve allocator maliyeti unutulmamalıdır.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · PowerShell/Terminal</b>: konteyner çalışmasını kontrol edin.</label><pre><code>docker ps</code></pre><p><code>redis-lab</code> Up olmalı; yoksa 01. sayfadaki Compose başlatma adımını uygulayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · PowerShell/Terminal</b>: Redis CLI açın.</label><pre><code>docker exec -it redis-lab redis-cli</code></pre><p>Prompt genellikle <code>127.0.0.1:6379&gt;</code> olur. <code>docker exec</code> var olan konteynerde komut çalıştırır; <code>-it</code> etkileşimli terminal sağlar.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: sunucu bilgilerini okuyun.</label><pre><code>INFO server</code></pre><p>Server bölümü ve <code>redis_version</code> benzeri alanlar döner. Tam çıktı sürüme bağlıdır; \`INFO\` bilgileri konfigürasyon ve destek taleplerinde kullanılır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: in-memory okuma/yazma hızını basit örnekle gözleyin.</label><pre><code>SET demo:product:42 &quot;Kahve&quot;
GET demo:product:42
DEL demo:product:42</code></pre><p>Her komut ayrı bir istek-yanıt turudur. Beklenen sırasıyla <code>OK</code>, <code>&quot;Kahve&quot;</code>, <code>(integer) 1</code>.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: çıkın.</label><pre><code>QUIT</code></pre><p>CLI bağlantısı kapanır; Docker konteyneri çalışmaya devam eder.</p></div>`,
    expected: "`INFO server` çıktısında Redis sürümü görünür; SET/GET/DEL sırasıyla OK, değer ve silinen anahtar sayısını verir.",
    errors: [["Could not connect to Redis at 127.0.0.1:6379: Connection refused", "Konteyner çalışmıyor veya port başka host portuna eşlenmiş.", "`docker ps` ve `docker compose ps` kontrol edin; doğru port/konteynerle bağlanın."], ["(error) WRONGTYPE Operation against a key holding the wrong kind of value", "Anahtarda beklenen tipte olmayan veri var.", "Anahtarı doğru komut ailesiyle kullanın; lab verisini `DEL key` ile temizleyip tekrar kurun."]],
    easy: "Redis yalnızca String saklayan bir cache midir?", ea: "Hayır. Birçok yerleşik veri yapısı ve persistence seçeneği vardır; cache yaygın kullanım alanlarından yalnızca biridir.",
    medium: "Tek bir uzun komut, aynı instance'taki diğer basit komutları neden geciktirebilir?", ma: "Temel komut işleme seri yürütülür; uzun iş event loop/komut yürütme akışını meşgul eder.",
    hard: "Banka hesaplarının doğruluk kaynağını Redis'e taşıma kararından önce üç gereksinim yazın.", ha: "Kabul edilebilir veri kaybı, persistence/backup/restore ve tutarlılık/işlem garantileri; ayrıca kapasite, HA, güvenlik ve kurtarma hedefleri değerlendirilir.",
    checklist: ["Redis ne yapar/ne yapmaz açıklanabilir", "Bellek ve persistence ayrımı anlaşılır", "Single-thread modelin trade-off'u bilinir", "Ürün kataloğu senaryosunda kaynak sistem ile cache ayrımı yapılır"],
  },
  {
    n: 3, file: "03-kurulum-temel-kavramlar.html", title: "Redis Installation and Fundamental Concepts", short: "Kurulum & temel kavramlar",
    duration: "75 dk", level: "Başlangıç + Orta",
    goals: ["Docker run ve Compose ile Redis başlatmak", "CLI ile key, TTL ve seçili veritabanı kullanmak", "redis.conf/command parametrelerinin rolünü tanımak", "Port, volume ve container yaşam döngüsünü açıklamak"],
    prereq: "Docker Desktop Running; 01. sayfadaki `redis-egitimi/docker/compose.yaml` hazır ve sabit Redis imajı etiketi seçilmiş olmalı.",
    opening: "“Şimdi aynı sunucuyu iki yolla başlatacağız: tek seferlik docker run ve tekrar üretilebilir Compose. Bir lab komutunun çalışması kadar, verinin konteyner silinince ne olacağını anlamak da önemli.”",
    questions: ["`docker rm` sonrası volume'daki veri silinir mi?", "TTL anahtarın ne zaman silineceğini garanti eder mi?", "Redis database index'i tenant izolasyonu için yeterli midir?"],
    traps: "İç konteyner portu ile host portunu karıştırmayın. `docker run --rm` kullanıldığında container kaldırılınca writable layer silinir. Redis logical DB'leri güvenlik sınırı değildir ve Cluster'da çoklu DB desteği yoktur.",
    why: "Tek komutlu deneme hızlıdır; tekrarlanabilir sınıf/ekip ortamı Compose dosyasıyla daha güvenilir olur. Host port eşlemesi uygulamaların bağlanmasını, volume ise konteyner değişse de veri dizininin saklanmasını sağlar.",
    what: "Key'ler byte dizisi olarak değerlendirilir; Redis tipli value saklar. TTL saniye cinsinden `EXPIRE` veya yazma sırasında `EX` ile belirlenir. `SELECT` logical database seçer. `redis.conf` parametreleri dosyadan, command line'dan veya config set ile (desteklenen ayarlarda) uygulanabilir; Compose command ve bind-mounted config de kullanılabilir.",
    how: "Port `127.0.0.1:6379:6379` ifadesinde sol taraf host portu, sağ taraf container portudur. `docker run -d` tek container başlatır. Compose servis/volume ayarını deklaratif hale getirir. Key örüntüsü `app:entity:id:field` kullanıp kişisel/secret veriyi key'e yazmayın.",
    expert: "Default DB index'i protokol/isim alanı kolaylığıdır, tenant authorization boundary değildir. Redis Cluster DB 0 dışında logical DB kullanımını desteklemez. TTL silinmesi yaklaşık zamanlama/erişim davranışına sahiptir; kritik deadline enforcement uygulama katmanında olmalı. Production config'i version-control ve secrets management ile yönetilmeli; `CONFIG SET` restart sonrası kalıcı olmayabilir.",
    lab: `
      <h3>A. Tek denemelik docker run</h3>
      <div class="tabs"><button class="tab active" type="button" data-tab="win">Windows</button><button class="tab" type="button" data-tab="mac">macOS / Linux</button>
      <div class="tab-panel active" data-panel="win"><p><b>Windows · PowerShell</b>: eğitim için doğrulanmış sabit imaj etiketini kullanın; \`&lt;major.minor.patch&gt;\` placeholder'ını değiştirin.</p><pre><code>docker run -d --name redis-quick -p 127.0.0.1:6380:6379 redis:&lt;major.minor.patch&gt;</code></pre></div>
      <div class="tab-panel" data-panel="mac"><p><b>macOS/Linux · Terminal</b>:</p><pre><code>docker run -d --name redis-quick -p 127.0.0.1:6380:6379 redis:&lt;major.minor.patch&gt;</code></pre></div></div>
      <p><code>-d</code> arka planda çalıştırır; <code>--name</code> sabit container adı verir; <code>-p</code> host 6380'i container 6379'a bağlar; <code>redis:&lt;sürüm&gt;</code> imaj etiketidir. Beklenen çıktı container ID. Bu örnek volume ve kalıcı ayar içermez; üretim kurulumu değildir.</p>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: geçici container'ın çalıştığını doğrulayın.</label><pre><code>docker ps --filter name=redis-quick</code></pre><p>\`redis-quick\` ve \`Up\` beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: geçici Redis yanıtını doğrulayın.</label><pre><code>docker exec -it redis-quick redis-cli -p 6379 PING</code></pre><p>\`PONG\` beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: yalnızca eğitim container'ını durdurup kaldırın.</label><pre><code>docker rm -f redis-quick</code></pre><p>\`-f\` çalışan container'ı durdurup kaldırır; bu geçici örnekte korunacak volume yoktur.</p></div>
      <h3>B. Ortak Compose servisini başlatma</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows · PowerShell</b>: Compose klasörüne geçin.</label><pre><code>cd $HOME\\redis-egitimi\\docker</code></pre><p><b>macOS · Terminal</b>:</p><pre><code>cd ~/redis-egitimi/docker</code></pre></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Compose servisini başlatın.</label><pre><code>docker compose up -d</code></pre><p>\`up\` YAML'den container'ları oluşturur; \`-d\` detached mod. \`compose.yaml\` içindeki image etiketi gerçek sabit sürüm olmalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: durum ve logları inceleyin.</label><pre><code>docker compose ps
docker compose logs --tail 30 redis</code></pre><p>\`ps\` Up durumunu; \`logs\` son 30 satırı gösterir. Normal başlatmada fatal error olmamalı.</p></div>
      <h3>C. Key, TTL ve database index</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: CLI açın.</label><pre><code>docker exec -it redis-lab redis-cli</code></pre><p>Prompt açılır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: key ekleyip TTL belirleyin.</label><pre><code>SET training:session:student-7 active EX 120
TTL training:session:student-7
GET training:session:student-7
EXISTS training:session:student-7</code></pre><p>\`SET key value EX seconds\` tek komutta TTL koyar. TTL 0–120 arası saniye döner (geçen süreye bağlı); \`GET\` active, \`EXISTS\` 1 beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: mevcut logical DB index'ini değiştirin.</label><pre><code>SELECT 1
SET training:sample one
GET training:sample
SELECT 0
GET training:sample</code></pre><p>DB 1'de \`one\`, DB 0'da \`(nil)\` beklenir. Bu eğitimde varsayılan DB 0'a dönün.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: TTL key'ini temizleyip çıkın.</label><pre><code>DEL training:session:student-7
QUIT</code></pre><p>\`DEL\` için integer 1/0, sonra bağlantı kapanması beklenir.</p></div>
      <h3>D. redis.conf ile ayar dosyası kullanma</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b> → <code>redis-egitimi/docker/</code> → <b>New File</b> → <code>redis.conf</code>; tam içerik:</label><pre><code>port 6379
appendonly yes
dir /data</code></pre><p>Bu eğitim dosyası yalnızca port, AOF ve veri dizinini tanımlar; diğer Redis ayarları varsayılan kalır. Parola gibi secret'ları dosyaya/Git'e koymayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: <code>docker/compose.yaml</code> içindeki <code>command</code> değerini <code>[&quot;redis-server&quot;, &quot;/usr/local/etc/redis/redis.conf&quot;]</code> yapın.</label><p>Aynı servisin <code>volumes</code> listesine mevcut data volume'unun altına <code>./redis.conf:/usr/local/etc/redis/redis.conf:ro</code> satırını ekleyin. Host dosya yolu, Compose dosyasına göreli olarak değerlendirilir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: yeni ayarı uygulamak için Redis servisini yeniden oluşturun.</label><pre><code>docker compose up -d --force-recreate redis</code></pre><p>Container yeniden oluşturulur, named volume korunur. \`docker compose logs --tail 30 redis\` ile config parse error olmadığını kontrol edin.</p></div>`,
    expected: "Compose `redis-lab` Up; logs'ta sunucu hazır; PING PONG. `TTL` pozitif saniye değeri, `GET` `active`, DB 1'deki key DB 0'da nil.",
    errors: [["Conflict. The container name \"/redis-quick\" is already in use", "Aynı adlı önceki lab container'ı duruyor.", "`docker rm -f redis-quick` ile yalnızca bu eğitim container'ını kaldırın; sonra komutu tekrar edin."], ["NOAUTH Authentication required", "Bağlandığınız instance auth istiyor.", "Doğru ortamın ACL/parolasını kullanın; parolayı komut satırı geçmişine yazmayın."], ["WRONGPASS invalid username-password pair or user is disabled", "Yanlış ACL kimlik bilgisi/kullanıcı.", "Eğitim konfigürasyonunu güvenli kanaldan doğrulayın; default user/ACL durumunu inceleyin."], ["ERR DB index is out of range", "Sunucu desteklemediği bir DB index istendi veya `databases` sınırı küçük.", "Config'te tanımlı index'i seçin; Redis Cluster'da yalnızca DB 0 kullanılabildiğini hatırlayın."], ["Error response from daemon: driver failed programming external connectivity ...", "Host port dolu veya Docker ağ sorunu.", "Host portunu 6380 gibi kullanılmayan bir değere alın; compose ve istemci ayarını birlikte güncelleyin."]],
    easy: "`TTL` -1 ve -2 ne demektir?", ea: "-1 key var ama expiration yok; -2 key yok.",
    medium: "Compose'da `127.0.0.1:6380:6379` hangi iki portu eşler?", ma: "Host loopback 6380 → container 6379.",
    hard: "Redis Cluster'a geçerken uygulama `SELECT 2` kullanıyorsa ne yapılmalı?", ha: "Logical DB bağımlılığını DB 0'a taşıyın; key prefix/ACL ile alan ayrımını tasarlayın. Cluster'da DB 0 dışında kullanılamaz.",
    checklist: ["Docker run ile geçici Redis başlatıp kaldırdım", "Compose, port ve volume davranışını açıklayabilirim", "SET EX, TTL, SELECT denendi", "Key adlandırması uygulama/team alanını içeriyor"],
  },
  {
    n: 4, file: "04-veri-yapilari-1.html", title: "Data Structures I: String, List, Set, Hash", short: "Veri yapıları I",
    duration: "90 dk", level: "Başlangıç → Orta",
    goals: ["String ve TTL ile cache/counter örüntüsü kurmak", "List ile uçlardan ekleme/çıkarma yapmak", "Set üyeliği ve kesişim işlemlerini kullanmak", "Hash'i nesne alanlarını saklamak için değerlendirmek"],
    prereq: "Compose Redis konteyneri çalışıyor; CLI açılabiliyor. Önceki sayfalardaki key prefix kuralını kullanın.",
    opening: "“Veri yapısı seçimini sadece komut ezberlemek olarak görmeyin. E-ticaret sepeti, etiket üyeliği ve ürün özellikleri farklı erişim örüntüleridir; doğru tipi seçmek kodu ve atomik işlemleri sadeleştirir.”",
    questions: ["Sepeti List mi Hash mi yaparsınız; hangi erişim gerekiyor?", "Set ile List arasındaki üyelik farkı nedir?", "INCR neden GET edip Python'da artırmaktan daha güvenlidir?"],
    traps: "Redis Hash bir SQL tablosu değildir; bütün field'ları sorgulamak için sınırsız tarama yapmayın. List'i otomatik olarak dayanıklı message queue saymayın. TTL key seviyesindedir; tek Hash field'ına TTL gerektiğinde sürüm özelliklerini doğrulayın veya farklı key tasarlayın.",
    why: "Veri yapısı, ihtiyacın sunucu tarafında atomik ve verimli ifade edilmesini sağlar. Ürün stok sayacı için `INCRBY`, kullanıcı etiket kümesi için Set, ürün alanları için Hash; bunların her biri uygulama tarafında veri çekip tekrar yazma ihtiyacını azaltır.",
    what: "`String` byte string/sayı/counter; `List` sıralı tekrar edebilen öğeler; `Set` benzersiz üyeler; `Hash` field-value alanları. Tüm veriler key altında tutulur. Komut karmaşıklıkları veri büyüklüğüne göre değişir; büyük liste/Hash işlemlerini ölçün.",
    how: "CLI ile örnekleri çalıştırın; key'ler `lab:` namespace'i taşır. Liste push/pop uçlarını, Set SADD/SISMEMBER/SINTER'ı, Hash HSET/HGETALL'ı gösterir. Üretimde sınırsız büyüyen key'e TTL/retention veya kontrollü trimming planı gerekir.",
    expert: "INCR/INCRBY tam sayı semantiğine göre atomik; uygulama GET+SET ise kayıp güncelleme riski taşır. `HGETALL` ve büyük `SMEMBERS` tam yapıyı döndürür; aşırı büyük yapılarda ağ/latency yükü yaratır. Sepet tutarlılığı, stok doğruluğu ve idempotency ayrıca tasarlanmalı; cache value tipi iş gereksiniminin tek kaynağı değildir.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · PowerShell/Terminal</b>: CLI açın.</label><pre><code>docker exec -it redis-lab redis-cli</code></pre><p>Prompt görülmeli.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · String</b>: stok sayacı oluşturup atomik artırın.</label><pre><code>SET lab:stock:SKU-42 8
INCRBY lab:stock:SKU-42 2
GET lab:stock:SKU-42</code></pre><p>Çıktı: OK, integer 10, "10".</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · List</b>: sınırlı queue benzeri örnek.</label><pre><code>RPUSH lab:jobs job-1 job-2 job-3
LLEN lab:jobs
LPOP lab:jobs
LRANGE lab:jobs 0 -1</code></pre><p>List length 3; pop \`job-1\`; kalan \`job-2\`, \`job-3\`. List alone ack/retry/durability semantics வழங்காது; reliable work stream için Streams değerlendirin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Set</b>: kategori üyeliği ve kesişim.</label><pre><code>SADD lab:user:7:tags redis python docker
SADD lab:user:8:tags python sql
SISMEMBER lab:user:7:tags redis
SINTER lab:user:7:tags lab:user:8:tags</code></pre><p>İlk sonuç integer 1; kesişim \`python\` (Set sıralı değildir).</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Hash</b>: ürün nitelikleri.</label><pre><code>HSET lab:product:42 name &quot;Pour-over&quot; price_cents 2499 active 1
HGET lab:product:42 name
HGETALL lab:product:42
HINCRBY lab:product:42 price_cents 100</code></pre><p>HSET new fields count 3; HGET \`Pour-over\`; HGETALL field/value çiftleri; HINCRBY 2599.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: lab anahtarlarını temizleyin.</label><pre><code>DEL lab:stock:SKU-42 lab:jobs lab:user:7:tags lab:user:8:tags lab:product:42
QUIT</code></pre><p>Silinen key sayısı 5.</p></div>`,
    expected: "String value 10; List length 3 then two pending items; Set membership 1 and intersection python; Hash price_cents 2599.",
    errors: [["WRONGTYPE Operation against a key holding the wrong kind of value", "Aynı key daha önce farklı tipte kullanıldı.", "`TYPE key` ile kontrol edin; lab key'ini silip doğru veri yapısıyla yeniden oluşturun."], ["ERR value is not an integer or out of range", "INCR/INCRBY hedefinde sayı olmayan value var.", "Key'in mevcut value'sini ve sayı aralığını doğrulayın; yanlış tipli key'i dönüştürün."], ["ERR wrong number of arguments for 'hset' command", "Field-value çiftleri eksik/yanlış sayıda.", "`HSET key field value [field value ...]` şeklinde tam çiftler gönderin."]],
    easy: "Tekrarı engelleyen ve üyelik kontrolüne uygun yapı hangisidir?", ea: "Set.",
    medium: "Bir Hash'te field güncellemek için hangi komut kullanılır?", ma: "HSET; mevcut field value'sini değiştirir, yeni field ekler.",
    hard: "İki istemci aynı sayacı eşzamanlı artırıyor. GET + uygulama tarafında +1 + SET neden riskli?", ha: "İki istemci aynı eski değeri okuyabilir ve biri diğerinin yazısını ezer; INCR/INCRBY sunucu tarafında atomik artırır.",
    checklist: ["String counter, List, Set, Hash komutlarını uyguladım", "Tip uyuşmazlığında TYPE/DEL ile teşhis edebilirim", "Büyük yapıların tam içeriğini döndürmenin maliyetini biliyorum"],
  },
  {
    n: 5, file: "05-veri-yapilari-2.html", title: "Data Structures II: Sorted Set, Bitmap, HyperLogLog, Geospatial, Stream", short: "Veri yapıları II",
    duration: "90 dk", level: "Orta",
    goals: ["Sorted Set ile skor sıralaması kurmak", "Bitmap ve HyperLogLog'un kullanım sınırlarını ayırt etmek", "Geospatial yakınlık sorgusunu denemek", "Stream'in append-only kayıt ve consumer-group temelini görmek"],
    prereq: "Redis CLI erişimi; sayfa 04'teki key/type yaklaşımını bilmek. Tüm örnekler geçici `lab:` key'leridir.",
    opening: "“Bu yapılar daha niş görünür ama üretimde leaderboard, günlük aktif kullanıcı tahmini, mağaza yakınlığı ve olay akışı gibi tekrarlanan sorunları kompakt çözer. Ölçüm ve doğruluk gereksinimini yapı seçiminden önce sorun.”",
    questions: ["Leaderboard'da eşit skorların sırasını nasıl belirlersiniz?", "HyperLogLog neden kesin kullanıcı listesini döndürmez?", "Stream ile Pub/Sub arasındaki dayanıklılık farkı nedir?"],
    traps: "HyperLogLog yaklaşık kardinalite verir; üye listesini veya kullanıcı kimliklerini geri alamazsınız. Sorted Set rank tie-break davranışına iş 로직ini bağlamadan doğrulayın. GEO koordinat sırası longitude, latitude'dır. Stream retention ve consumer pending-entry yönetimi unutulmasın.",
    why: "Bir kampanyanın leaderboard'ı sıralama ve rank ister; günlük aktif kullanıcı sayımı kesin listeyi değil yaklaşık sayıyı isteyebilir. Her iki problemi aynı Set ile çözmek gereksiz bellek harcatabilir.",
    what: "Sorted Set üye+score tutar; Bitmap bit konumlarıyla boolean durumlar saklar; HyperLogLog yaklaşık benzersiz eleman sayar; GEO komutları konumsal arama sağlar; Stream kayıt kimlikli, append-only log ve consumer group/ack mekanizması sunar. Bunlar kullanım ihtiyaçlarına göre seçilir, birbirlerinin eşdeğeri değildir.",
    how: "ZADD/ZRANGE rank sorgusu; SETBIT/GETBIT bit pozisyonu; PFADD/PFCOUNT tahmini kardinalite; GEOADD/GEOSEARCH yakınlık; XADD/XREADGROUP/XACK mesaj akışı. Sürüm ve komut seçenekleri değişebileceği için eğitim imajı sürümünde CLI `HELP command` veya resmi komut referansıyla doğrulayın.",
    expert: "Sorted Set'te yüksek cardinality/çok sık rank sorgusu bellek ve CPU maliyeti yaratır. Bitmap ID aralığı seyrekse boş bitler pahalı olabilir. HyperLogLog'un standart hata oranı yaklaşık %0.81 olup sonuç yaklaşık değerdir; kesin faturalama/uygunluk için kullanmayın. Streams'te consumer group pending entry list (PEL), reclaim/claim, trimming ve retry politikası tasarlanmalıdır.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: redis-cli açın.</label><pre><code>docker exec -it redis-lab redis-cli</code></pre></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Sorted Set</b>: skor tablosu.</label><pre><code>ZADD lab:leaderboard 120 alice 95 bob 120 chris
ZRANGE lab:leaderboard 0 -1 WITHSCORES
ZREVRANK lab:leaderboard alice</code></pre><p>Üyeler skorla artan; aynı skordaki leksikografik bağ sırasını eğitim sürümünde gözleyin. Rank 0-based'tir ve tie sırası iş kuralı olmamalıdır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Bitmap</b>: günlük giriş bitlerini işaretleyin.</label><pre><code>SETBIT lab:attendance:day1 7 1
SETBIT lab:attendance:day1 12 1
GETBIT lab:attendance:day1 7
BITCOUNT lab:attendance:day1</code></pre><p>GETBIT 1, BITCOUNT 2. Offset'ler 0'dan başlar; kullanıcı ID aralığının yoğunluğunu hesaplayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · HyperLogLog</b>: anonim distinct tahmini.</label><pre><code>PFADD lab:daily:visitors u1 u2 u1
PFCOUNT lab:daily:visitors</code></pre><p>COUNT yaklaşık 2 döner (küçük örnekte çoğunlukla 2). Üyeleri geri getiremez.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Geospatial</b>: koordinat sırası longitude latitude.</label><pre><code>GEOADD lab:shops 29.0 41.0 shop-a 29.1 41.05 shop-b
GEOSEARCH lab:shops FROMLONLAT 29.0 41.0 BYRADIUS 20 km WITHDIST</code></pre><p>En az shop-a ve mesafesi görünür; shop-b aralık içinde olabilir. Koordinatlar örnektir, gerçek adres koordinatı değildir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Stream</b>: kayıt ekleyip okuyun.</label><pre><code>XADD lab:orders * order_id O-100 status created
XADD lab:orders * order_id O-101 status created
XRANGE lab:orders - +</code></pre><p>İki otomatik stream ID ve field/value kayıtları döner. Stream kaydı Pub/Sub gibi anlık teslimle yok olmaz.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Stream consumer group</b>: group oluşturup mesaj tüketin.</label><pre><code>XGROUP CREATE lab:orders fulfillment 0 MKSTREAM
XREADGROUP GROUP fulfillment worker-1 COUNT 2 STREAMS lab:orders &gt;
XACK lab:orders fulfillment &lt;ilk-mesaj-id&gt;</code></pre><p>İlk \`XREADGROUP\` çıktısından ilk ID'yi kopyalayıp placeholder ile değiştirin. \`XACK\` integer 1 döndürür. Consumer group mesajları otomatik ack etmez; başarısız consumer PEL incelemesi gerekir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: lab key'lerini temizleyin.</label><pre><code>DEL lab:leaderboard lab:attendance:day1 lab:daily:visitors lab:shops lab:orders
QUIT</code></pre></div>`,
    expected: "Leaderboard skor/rank döndürür; bitmap count 2; PFCOUNT yaklaşık 2; GEOSEARCH yakın mağazayı; Stream XRANGE kayıtları ve XREADGROUP mesajları gösterir.",
    errors: [["ERR unknown command 'GEOSEARCH'", "Redis sürümü eski veya komut desteklenmiyor.", "Kullanılan imaj sürümünü doğrulayın ve lab imajını desteklenen sabit sürüme güncelleyin; komut referansına bakın."], ["BUSYGROUP Consumer Group name already exists", "Group daha önce oluşturulmuş.", "Bu normal tekrar çalıştırma durumudur; `XINFO GROUPS lab:orders` ile doğrulayın veya lab key'ini temizleyip baştan başlayın."], ["NOGROUP No such key or consumer group", "Stream/group adı yanlış veya group henüz oluşturulmadı.", "Key ve group adını birebir doğrulayın; `XGROUP CREATE ... MKSTREAM` uygulayın."], ["ERR value is not an integer or out of range", "Bitmap offset/range geçersiz.", "Offset'i non-negative integer ve value'yu 0/1 yapın."]],
    easy: "Kesin üyeleri saklamadan benzersiz sayıyı yaklaşık veren yapı hangisi?", ea: "HyperLogLog.",
    medium: "Stream consumer group mesajı işlediğini nasıl bildirir?", ma: "`XACK stream group message-id` ile; aksi halde pending list'te kalır.",
    hard: "Günlük 100 milyon kullanıcı ID'si seyrek ve geniş aralıkta. Bitmap seçmeden önce neyi ölçersiniz?", ha: "ID aralığının yoğunluğu ve bitset memory'si; seyrek dağılımda Bitmap verimsiz olabilir. Set/HLL veya parçalı bitmap'i ölçüp doğruluk gereksinimine göre seçin.",
    checklist: ["ZSET leaderboard sıralaması", "Bitmap bit/count", "HLL yaklaşık cardinality", "GEO koordinat sırası", "Stream group ve ack denendi"],
  },
  {
    n: 6, file: "06-ileri-islemler.html", title: "Advanced Redis Operations", short: "İleri işlemler",
    duration: "100 dk", level: "Orta → İleri",
    goals: ["MULTI/EXEC/WATCH transaction semantiğini açıklamak", "Pipeline ile ağ gidiş-dönüşlerini azaltmak", "RDB/AOF persistence trade-off'larını kıyaslamak", "Eviction, SCAN, keyspace notifications ve bellek ölçümünü uygulamak"],
    prereq: "Compose Redis çalışıyor. Kalıcılık deneyleri için veri önemli olmayan lab instance kullanın.",
    opening: "“İleri özelliklerde bir komutun atomik olması ile çok adımlı iş kuralının güvenli olması aynı şey değil. Transaction, pipeline ve persistence farklı problemleri çözer; şimdi aralarındaki sınırları deneyelim.”",
    questions: ["Pipeline komutlarını atomik yapar mı?", "WATCH hangi yarış durumunu tespit eder?", "AOF her yazıyı anında diske yazmayı garanti eder mi?"],
    traps: "`MULTI/EXEC` SQL rollback transaction'ı gibi değildir; `EXEC` içindeki runtime error önceden başarılı komutları otomatik geri almaz. Pipeline ağ turunu azaltır, atomiklik vermez. `KEYS *` prod'da bloklayabilir; SCAN cursor tamamlanana kadar yinelenir ve duplicate döndürebilir.",
    why: "Ağ round-trip'i yoğun küçük komutlarda maliyetli olabilir; pipeline komutları toplar. Birden çok komutun koşullu uygulanması gerekiyorsa WATCH/MULTI kullanılabilir. Kalıcılık ve eviction ise veri kaybı/memory pressure davranışını belirler.",
    what: "Redis transaction komutları kuyruğa alıp EXEC ile ardışık uygular. WATCH key değişimini izler, çatışmada EXEC nil dönebilir. RDB snapshot, AOF write log; eviction memory limit aşımında key çıkarma stratejisidir. SCAN cursor tabanlı incremental iteration'dır. Keyspace notification Pub/Sub event üretir; varsayılan olarak kapalıdır.",
    how: "Denemede transaction, pipeline, SCAN, MEMORY USAGE ve INFO memory ölçülür. Persistence config değişikliği Compose ile kontrollü uygulanır; geçici volume kaldırma veri kaybı doğurur. Eviction testini lab instance'ta ve ölçülebilir maxmemory ile yapın.",
    expert: "RDB/AOF seçimi Redis sürümünün AOF fsync ayarı, disk ve recovery testine göre yapılır; backup restore denenmeden persistence var diye güvenmeyin. `noeviction`, yazma reddi; allkeys/volatile politikaları farklı key kümelerini etkiler. `maxmemory` container limiti ve işletim sistemi memory headroom ile uyumlu olmalı. SCAN tam snapshot değildir; değişen keyspace sırasında tutarlı export garanti etmez.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: redis-cli başlatın.</label><pre><code>docker exec -it redis-lab redis-cli</code></pre></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Transaction</b>: komutları kuyruğa alın ve uygulayın.</label><pre><code>MULTI
SET lab:balance 100
INCRBY lab:balance 25
EXEC
GET lab:balance</code></pre><p>\`QUEUED\` yanıtları, EXEC altında sonuçlar ve GET \`125\` beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · WATCH</b>: aşağıdaki sırayı tek istemcide deneyin.</label><pre><code>WATCH lab:balance
MULTI
INCRBY lab:balance 1
EXEC</code></pre><p>Başka istemci watched key'i EXEC öncesi değiştirmediği için sonuçlar görünür. Çatışmayı görmek için ikinci CLI açıp EXEC öncesi key'i değiştirin; EXEC nil/aborted transaction döndürmelidir. Uygulama retry döngüsü kurmalıdır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · SCAN</b>: namespace key'lerini parça parça gezin.</label><pre><code>SCAN 0 MATCH lab:* COUNT 100</code></pre><p>Çıktı cursor ve keys listesi. Cursor 0 olana dek dönen cursor'u yeni SCAN çağrısına verin. COUNT bir öneridir; tek sayfada tüm sonucu garanti etmez.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Memory</b>: key başına tahmini bellek.</label><pre><code>MEMORY USAGE lab:balance
INFO memory</code></pre><p>İlk komut byte tahmini, ikincisi memory metrikleri. Küçük örnek allocation overhead'i büyük sistem gibi genellenemez.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: efektif memory limit ve eviction policy'yi okuyun.</label><pre><code>docker exec redis-lab redis-cli CONFIG GET maxmemory
docker exec redis-lab redis-cli CONFIG GET maxmemory-policy</code></pre><p>\`maxmemory\` 0 ise Redis config'te explicit maxmemory set edilmemiştir; container/cgroup memory limiti yine uygulanabilir. \`maxmemory-policy\` adı, örneğin \`noeviction\`, \`allkeys-lru\`, \`allkeys-lfu\`, \`volatile-lru\` veya \`volatile-ttl\`, eviction behavior'ı belirler. Production policy'yi workload ve key TTL dağılımına göre seçin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI · Keyspace notifications</b>: yalnızca lab için expiration event yayınını açın.</label><pre><code>CONFIG SET notify-keyspace-events Ex</code></pre><p>\`OK\` beklenir. Config değişimi sürüm/policy tarafından engellenebilir; production'da event kaybı/throughput etkisini ölçün.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · İkinci Terminal</b>: expiration event kanalına abone olun; bu terminal açık kalır.</label><pre><code>docker exec -it redis-lab redis-cli PSUBSCRIBE __keyevent@0__:expired</code></pre><p>Subscription confirmation görünür. Bu komutu çalıştırdıktan sonra yeni bir terminal açın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Üçüncü Terminal</b>: kısa ömürlü key oluşturun.</label><pre><code>docker exec redis-lab redis-cli SET lab:expire soon EX 5</code></pre><p>İkinci terminalde yaklaşık 5 saniye sonra expiration event görünür. Subscription terminalinde Ctrl+C ile çıkın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: AOF/RDB ayar durumunu inceleyin.</label><pre><code>docker exec redis-lab redis-cli INFO persistence
docker exec redis-lab redis-cli CONFIG GET appendonly
docker exec redis-lab redis-cli CONFIG GET save</code></pre><p>Çıktı mevcut efektif ayarları gösterir; AOF açık ise appendonly \`yes\`. RDB save schedule sürüme/konfigürasyona göre görünür. \`CONFIG GET\` erişimi ACL tarafından kısıtlanabilir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: lab instance'ında RDB snapshot'ını arka planda başlatın.</label><pre><code>docker exec redis-lab redis-cli BGSAVE</code></pre><p>\`Background saving started\` beklenir; zaten sürüyorsa komut bunu belirten hata döndürebilir. \`SAVE\` kullanmayın, ana thread'i bloklayabilir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: persistence durumunu kontrol edin.</label><pre><code>docker exec redis-lab redis-cli INFO persistence</code></pre><p>\`rdb_bgsave_in_progress:0\` ve son başarılı snapshot bilgisi beklenir. AOF \`/data\` volume'una yazılır; volume tek başına off-host backup değildir. Restore testini ayrıca yapın.</p></div>`,
    expected: "EXEC balance 125; WATCH çatışmasında transaction abort; SCAN cursor/list; MEMORY USAGE bytes; notification event; INFO persistence AOF status.",
    errors: [["(nil) from EXEC", "WATCH key EXEC öncesi değişti; optimistic lock çatışması.", "İşlemi bounded retry/backoff ile baştan okuyup uygula; retry sınırı aşılırsa hatayı üst katmana bildir."], ["ERR unknown subcommand or wrong number of arguments for 'MEMORY'", "Eski Redis sürümü/yanlış alt komut.", "Sürümü ve `HELP MEMORY` çıktısını doğrulayın; desteklenmeyen komutu kullanmayın."], ["ERR CONFIG SET failed ...", "Managed/policy ortamında config komutu kapalı.", "ACL/policy'yi yetkili yöneticiyle kontrol edin; production kontrolünü aşmaya çalışmayın."], ["OOM command not allowed when used memory > 'maxmemory'", "Memory limit dolmuş ve eviction policy yazmayı engelliyor.", "Bellek/key büyümesini inceleyin; TTL/eviction kapasitesini bilinçli ayarlayın ve yükü düşürün."]],
    easy: "Pipeline ile transaction arasındaki temel fark nedir?", ea: "Pipeline round-trip sayısını azaltır; transaction komutları seri bir atomik yürütme grubu haline getirir, fakat rollback sağlamaz.",
    medium: "SCAN'ın terminal cursor'u nedir?", ma: "0; yine de tam iterasyon bitene kadar cursor ile devam edilmelidir.",
    hard: "AOF enabled ve volume var. Bu tek başına felaket kurtarma kanıtı mıdır?", ha: "Hayır. Disk/volume kaybına karşı yedek, off-host kopya, restore prosedürü ve RPO/RTO testleri gerekir.",
    checklist: ["EXEC/WATCH çatışması anlaşılır", "Pipeline atomiklik değildir", "RDB/AOF rolleri bilinir", "SCAN cursor döngüsü bilinir", "Bellek ve eviction üretim etkisi değerlendirildi"],
  },
  {
    n: 7, file: "07-python-entegrasyonu.html", title: "Integration of Redis with Python", short: "Python entegrasyonu",
    duration: "120 dk", level: "Başlangıç → İleri",
    goals: ["venv ve requirements.txt ile izole proje kurmak", "redis-py bağlantı havuzu, timeout ve hata yönetimi kullanmak", "Python'dan temel Redis yapılarını uygulamak", "sync/async istemciyi ayırmak ve Flask/FastAPI entegrasyonunu tasarlamak"],
    prereq: "Python 3.x, VS Code Python extension, Docker Desktop ve 01. sayfadaki `redis-egitimi/` klasör yapısı hazır olmalı.",
    opening: "“Şimdi Redis komutlarını gerçek bir uygulama sürecine alıyoruz. Bağlantı havuzunu, timeout'u ve veri serileştirmeyi doğru kurmak önemlidir; çalışan bir `PING` tek başına üretim entegrasyonu değildir.”",
    questions: ["Neden her HTTP isteğinde yeni Redis TCP bağlantısı açmıyoruz?", "JSON serileştirmenin schema değişimine etkisi nedir?", "Timeout ve retry yanlış kullanılırsa yük neden artabilir?"],
    traps: "Sync Redis client'ı async event loop içinde bloklayıcı biçimde kullanmayın. Retry'ı sınırsız yapmayın. `decode_responses=True` bytes/string davranışını değiştirir; binary payload için uygun olmayabilir. RedisError'dan daha geniş exception'ları sessizce yutmayın.",
    why: "Uygulamanın her istekte TCP bağlantısı kurması gecikme ve kaynak tüketimi ekler. redis-py connection pool bağlantıları tekrar kullanır. Timeout sınırsız beklemeyi engeller; bounded retry geçici hataları yönetir ama outage sırasında retry storm yaratmamalıdır.",
    what: "redis-py sync `redis.Redis` ve async `redis.asyncio.Redis` API'leri sağlar. Client pool'u varsayılan olarak bağlantıları yönetir. `decode_responses=True` string döndürür. Hata tipleri redis-py exception hiyerarşisindedir. Serialization bir schema/versiyon kararıdır; Python `pickle` güvenilmeyen veride kod çalıştırma riski taşır, kullanmayın.",
    how: "Proje `python/` altında venv, requirements.txt, `app.py` içerir. Redis URL'si environment variable ile verilebilir. Lab'ta basit değer, hash, pipeline, transaction, Lua, Pub/Sub, async ve web framework cache örneği aşamalı uygulanır.",
    expert: "Pool max_connections, connect/socket timeout ve health check ayarı workload'a göre seçilip ölçülür; sınırsız retry yok. Redis `decode_responses=True` UTF-8 veriye uygundur, binary data için bytes kullanın. Async client kapatılmalı (`aclose` güncel redis-py API); sürüm API'sini pinleyip doğrulayın. Web cache key'inde tenant/authorization context ve invalidation kapsamı unutulmamalı.",
    lab: `
      <h3>1. Sanal ortam ve paket kurulumu</h3>
      <div class="tabs"><button class="tab active" type="button" data-tab="win">Windows PowerShell</button><button class="tab" type="button" data-tab="mac">macOS Terminal</button>
      <div class="tab-panel active" data-panel="win"><ol><li><b>Windows · PowerShell</b>: proje klasörüne geçin.<pre><code>cd $HOME\\redis-egitimi\\python</code></pre></li><li><b>Windows · PowerShell</b>: sanal ortam oluşturun.<pre><code>py -m venv .venv</code></pre></li><li><b>Windows · PowerShell</b>: sanal ortamı etkinleştirin.<pre><code>.\\.venv\\Scripts\\Activate.ps1</code></pre></li><li><b>Windows · PowerShell</b>: pip'i güncelleyin.<pre><code>python -m pip install --upgrade pip</code></pre></li></ol><p>Venv Python ortamını proje içinde izole eder; aktivasyon bu shell'i venv'e yönlendirir. ExecutionPolicy engelinde: <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> (kurum politikası izin veriyorsa), PowerShell'i kapatıp açın. Global policy'yi düşürmeyin.</p></div>
      <div class="tab-panel" data-panel="mac"><ol><li><b>macOS · Terminal</b>: proje klasörüne geçin.<pre><code>cd ~/redis-egitimi/python</code></pre></li><li><b>macOS · Terminal</b>: sanal ortam oluşturun.<pre><code>python3 -m venv .venv</code></pre></li><li><b>macOS · Terminal</b>: sanal ortamı etkinleştirin.<pre><code>source .venv/bin/activate</code></pre></li><li><b>macOS · Terminal</b>: pip'i güncelleyin.<pre><code>python -m pip install --upgrade pip</code></pre></li></ol><p>Shell prompt başında \`(.venv)\` beklenir. Her yeni terminalde aktivasyonu tekrarlayın.</p></div></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b> → File → Open Folder… → \`redis-egitimi/python\`. Explorer → New File → \`requirements.txt\`, tam içerik:</label><pre><code>redis==&lt;verified-version&gt;
Flask==&lt;verified-version&gt;</code></pre><p>İki placeholder'ı sınıf öncesi PyPI'dan doğrulanmış sabit sürümlerle değiştirin; \`latest\`/tahmini sürüm yazmayın. Flask bu sayfadaki opsiyonel web lab'ı içindir. \`hiredis\` zorunlu değildir; ölçümle gereksinim doğrulanmadan eklemeyin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code Terminal</b>: aktif venv içinde requirements dosyasındaki paketleri yükleyin.</label><pre><code>python -m pip install -r requirements.txt</code></pre><p>Placeholder'ları gerçek pinlenmiş sürümlere çevirdikten sonra kurulum başarılı olmalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code Terminal</b>: kurulu paketleri doğrulayın.</label><pre><code>python -m pip list</code></pre><p>\`redis\` ve venv içindeki \`pip\` görünür olmalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b> → Command Palette (Ctrl+Shift+P / ⇧⌘P) → <b>Python: Select Interpreter</b> → \`redis-egitimi/python/.venv\` interpreter'ını seçin.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b> → \`app.py\` oluşturun ve aşağıdaki tam kodu kaydedin. \`REDIS_URL\` verilmezse local compose adresini kullanır.</label><pre><code>from __future__ import annotations

import json
import os
from typing import Any

import redis
from redis.exceptions import RedisError


def main() -&gt; None:
    url = os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;)
    client = redis.Redis.from_url(
        url,
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
        max_connections=20,
    )
    try:
        client.ping()
        product: dict[str, Any] = {&quot;id&quot;: 42, &quot;name&quot;: &quot;Kahve&quot;, &quot;price&quot;: 12.5}
        client.set(&quot;py:product:42&quot;, json.dumps(product), ex=60)
        raw = client.get(&quot;py:product:42&quot;)
        print(&quot;PING: PONG&quot;)
        print(&quot;Product:&quot;, json.loads(raw) if raw is not None else None)
        client.hset(&quot;py:cart:7&quot;, mapping={&quot;SKU-42&quot;: 2, &quot;SKU-9&quot;: 1})
        print(&quot;Cart:&quot;, client.hgetall(&quot;py:cart:7&quot;))
        client.set(&quot;py:views:42&quot;, 0)
        with client.pipeline(transaction=False) as pipe:
            pipe.incr(&quot;py:views:42&quot;)
            pipe.incr(&quot;py:views:42&quot;)
            print(&quot;Pipeline:&quot;, pipe.execute())
        with client.pipeline(transaction=True) as pipe:
            pipe.set(&quot;py:transaction:status&quot;, &quot;queued&quot;)
            pipe.incr(&quot;py:transaction:count&quot;)
            print(&quot;Transaction:&quot;, pipe.execute())
    except RedisError as exc:
        raise RuntimeError(f&quot;Redis operation failed: {exc}&quot;) from exc
    finally:
        client.close()


if __name__ == &quot;__main__&quot;:
    main()</code></pre><p>\`from_url\` URL'den bağlantı kurar; \`decode_responses\` string döndürür; connect/socket timeout ve max pool limitleri bounded'dır; JSON tip ipuçlu dict'i saklar; pipeline ağ turunu azaltır; \`RedisError\` görünür hata üretir; finally client pool'u kapatır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: Run → <b>Run Without Debugging</b> (Ctrl+F5 / Ctrl+F5) veya sağ üst Run Python File ile çalıştırın.</label></div>
      <div class="step"><label><input type="checkbox"> <b>Windows PowerShell/macOS Terminal</b>: Python sürümünü doğrulayın.</label><pre><code>python --version</code></pre><p>Python 3.x olmalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows PowerShell/macOS Terminal</b>: aktif interpreter'daki paketleri listeleyin.</label><pre><code>python -m pip list</code></pre><p>Pinlenmiş redis-py sürümü görünür.</p></div>
      <h3>2. Async API farkı (tam çalıştırılabilir örnek)</h3>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`async_demo.py\` oluşturun.</label><pre><code>import asyncio
import os

import redis.asyncio as redis


async def main() -&gt; None:
    client = redis.Redis.from_url(
        os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;),
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )
    try:
        print(&quot;PING:&quot;, await client.ping())
        await client.set(&quot;py:async:demo&quot;, &quot;ready&quot;, ex=30)
        print(&quot;Value:&quot;, await client.get(&quot;py:async:demo&quot;))
    finally:
        await client.aclose()


if __name__ == &quot;__main__&quot;:
    asyncio.run(main())</code></pre><p>Async komutlar \`await\` edilir; event loop içinde blocking client kullanılmaz; client pool \`aclose()\` ile kapatılır. VS Code terminalinde <code>python async_demo.py</code> çalıştırın; \`PING: True\`, \`Value: ready\` beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`structures_demo.py\` dosyasını \`python/\` içinde oluşturun.</label><pre><code>import os
import redis


def main() -&gt; None:
    client = redis.Redis.from_url(os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;), decode_responses=True)
    try:
        client.set(&quot;py:t:string&quot;, &quot;hello&quot;, ex=60)
        client.rpush(&quot;py:t:list&quot;, &quot;job-1&quot;, &quot;job-2&quot;)
        client.sadd(&quot;py:t:set&quot;, &quot;redis&quot;, &quot;python&quot;)
        client.hset(&quot;py:t:hash&quot;, mapping={&quot;name&quot;: &quot;Kahve&quot;})
        client.zadd(&quot;py:t:zset&quot;, {&quot;alice&quot;: 120, &quot;bob&quot;: 95})
        client.setbit(&quot;py:t:bitmap&quot;, 7, 1)
        client.pfadd(&quot;py:t:hll&quot;, &quot;u1&quot;, &quot;u2&quot;)
        client.geoadd(&quot;py:t:geo&quot;, [(29.0, 41.0, &quot;shop-a&quot;)])
        client.xadd(&quot;py:t:stream&quot;, {&quot;type&quot;: &quot;created&quot;})
        print(client.get(&quot;py:t:string&quot;), client.lrange(&quot;py:t:list&quot;, 0, -1))
        print(client.smembers(&quot;py:t:set&quot;), client.hgetall(&quot;py:t:hash&quot;))
        print(client.zrange(&quot;py:t:zset&quot;, 0, -1, withscores=True))
        print(client.bitcount(&quot;py:t:bitmap&quot;), client.pfcount(&quot;py:t:hll&quot;))
        print(client.geosearch(&quot;py:t:geo&quot;, longitude=29.0, latitude=41.0, radius=10, unit=&quot;km&quot;))
        print(client.xrange(&quot;py:t:stream&quot;, min=&quot;-&quot;, max=&quot;+&quot;))
    finally:
        client.close()


if __name__ == &quot;__main__&quot;:
    main()</code></pre><p>Metotlar sırasıyla String, List, Set, Hash, Sorted Set, Bitmap, HyperLogLog, GEO ve Stream API'leridir. \`python structures_demo.py\` çıktısında hello/list, üyeler/Hash, skor sırası, 1/2 sayımları, shop-a ve Stream kaydı görünür. redis-py sürümünde \`geosearch\` imzasını kurulumda doğrulayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`retry_demo.py\` oluşturun; yalnızca idempotent GET için iki denemeli retry.</label><pre><code>import os
import time
      from typing import Optional

import redis
from redis.exceptions import ConnectionError, TimeoutError


def read_with_retry(client: redis.Redis, key: str) -&gt; Optional[str]:
    for attempt in range(2):
        try:
            return client.get(key)
        except (ConnectionError, TimeoutError):
            if attempt == 1:
                raise
            time.sleep(0.1)
    raise RuntimeError(&quot;unreachable retry state&quot;)


client = redis.Redis.from_url(os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;), decode_responses=True, socket_connect_timeout=1, socket_timeout=1)
try:
    print(read_with_retry(client, &quot;py:product:42&quot;))
finally:
    client.close()</code></pre><p>En fazla 2 deneme; yalnızca bağlantı/timeout hataları; ikinci hata çağırana yükselir. Write komutlarını körlemesine retry etmeyin. Üretimde deadline, backoff+jitter, idempotency ve retry budget gerekir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`flask_cache.py\` oluşturun.</label><pre><code>import json
import os

import redis
from flask import Flask, jsonify
from redis.exceptions import RedisError


app = Flask(__name__)
client = redis.Redis.from_url(os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;), decode_responses=True, socket_connect_timeout=1, socket_timeout=1)


@app.get(&quot;/products/&lt;int:product_id&gt;&quot;)
def get_product(product_id: int):
    key = f&quot;web:catalog:product:{product_id}&quot;
    try:
        cached = client.get(key)
        if cached is not None:
            return jsonify(json.loads(cached)), 200
        value = {&quot;id&quot;: product_id, &quot;name&quot;: &quot;Kahve&quot;}
        client.set(key, json.dumps(value), ex=60)
        return jsonify(value), 200
    except RedisError:
        app.logger.exception(&quot;Redis cache unavailable&quot;)
        return jsonify({&quot;error&quot;: &quot;cache unavailable&quot;}), 503


if __name__ == &quot;__main__&quot;:
    app.run(host=&quot;127.0.0.1&quot;, port=5000, debug=False)</code></pre><p>Cache-aside route; Redis failure loglanır ve bu örnek fail-closed olarak 503 döner. \`python flask_cache.py\` çalıştırın, tarayıcıda \`http://127.0.0.1:5000/products/42\` açın; JSON beklenir. Flask development server yalnızca local lab içindir.</p></div>
      <div class="info">FastAPI async handler'da \`redis.asyncio\` seçin ve lifespan/shutdown'da \`aclose()\` çağırın. Her iki framework'te de production için kaynak DB, auth/tenant-aware key, invalidation, request deadline ve outage policy ekleyin.</div>`,
    expected: "Aktif venv içinde `pip list` Flask ve redis-py sürümlerini gösterir. `app.py` PING, JSON, Hash cart, pipeline ve transaction sonuçları verir. Async demo `PING: True`, `Value: ready`; structures demo her Redis tipini; Flask route JSON yanıtı verir.",
    errors: [["ModuleNotFoundError: No module named 'redis'", "Paket farklı interpreter'a kuruldu veya venv aktif değil.", "VS Code interpreter'ını `.venv` seçin; terminalde aktivasyon sonrası `python -m pip install -r requirements.txt` çalıştırın."], ["redis.exceptions.ConnectionError: Error 111 connecting to localhost:6379. Connection refused.", "Compose Redis çalışmıyor/port farklı.", "`docker compose ps` kontrol edin; Compose'u başlatın; `REDIS_URL` host portunu doğrulayın."], ["ExecutionPolicy ... running scripts is disabled", "PowerShell venv activation script engellendi.", "Şirket politikası izin veriyorsa `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`; alternatif olarak `.venv\\Scripts\\python.exe` ile doğrudan çalıştırın."], ["TypeError: object bool can't be used in 'await' expression", "Sync Redis client ile async API karıştırıldı.", "`redis.asyncio` client'ı kullanın; sync client method'larında `await` kullanmayın."], ["TimeoutError: Timeout connecting to server", "Ağ/port yok veya timeout çok düşük.", "Local Redis sağlık kontrolü ve doğru URL'yi doğrulayın; gerçek latency SLO'ya göre timeout'u bilinçli ayarlayın."]],
    easy: "JSON `dumps`/`loads` bu örnekte ne yapar?", ea: "Python dict'i JSON metnine çevirip geri dict'e dönüştürür.",
    medium: "Pipeline `transaction=False` neyi sağlar, neyi sağlamaz?", ma: "Round-trip sayısını azaltır; birden çok komutun atomik olmasını sağlamaz.",
    hard: "Retry eklerken hangi üç sınırı belirlemelisiniz?", ha: "Retry edilebilir hata sınıfı/idempotency, maksimum deneme + backoff/jitter, toplam request deadline ve hata görünürlüğü.",
    checklist: ["venv/requirements/interpreter doğrulandı", "Pool, timeout ve cleanup kullanıldı", "JSON + Redis Hash/pipeline denendi", "Sync ve async ayrımı açıklanabilir", "Secret içeren URL loglanmıyor"],
  },
  {
    n: 8, file: "08-yuksek-erisebilirlik.html", title: "High Availability and Replication", short: "HA & replication",
    duration: "120 dk", level: "Orta → İleri",
    goals: ["Primary-replica replikasyon semantiğini açıklamak", "Sentinel quorum ve failover akışını modellemek", "Cluster sharding/redirect kavramlarını ayırt etmek", "Docker Compose ile lab topolojisi ve kontrollü failover denemek"],
    prereq: "Docker Desktop kaynakları yeterli; 01. sayfa lab yapısı hazır. HA lab'ı için host portlarını ve çoklu container kaynak sınırını kontrol edin.",
    opening: "“Yüksek erişilebilirlik, tek bir checkbox değildir. Replikasyon kopya üretir; Sentinel primary'nin yerini izler ve failover kararı verir; Cluster ise shard'lama ve yatay ölçekleme ekler. Hiçbiri otomatik olarak sıfır veri kaybı garantilemez.”",
    questions: ["Async replication sırasında primary kaybında hangi yazılar kaybolabilir?", "Sentinel quorum ile Redis Cluster aynı şey midir?", "Client failover sonrası master adresini nasıl keşfeder?"],
    traps: "Sentinel replica'ya yazmayı kendiliğinden yönlendirmez. Sentinel erişilebilirliği ile uygulama client discovery ayrı konudur. Container'ları aynı laptopta çalıştırmak host arızası HA testi değildir. Port publishing ve healthcheck'ler topolojiye göre tasarlanmalı.",
    why: "Bir Redis instance'ın çökmesi uygulama için cache miss, session kaybı veya geçici hata anlamına gelebilir. Replikasyon okuma kopyası ve failover temelini kurar; Cluster slot\'larıyla veriyi parçalara böler.",
    what: "Primary-replica replication genellikle asenkrondur. Sentinel monitoring, notification, automatic failover ve primary discovery sunar. Redis Cluster keyspace'i hash slot'lara böler; client MOVED/ASK yönlendirmelerini desteklemelidir. Sentinel HA orchestration; Cluster sharding + HA'dır.",
    how: "Compose lab servisleri ayrı container olarak aynı Docker network'te çalışır. Replica `replicaof primary port`; Sentinel config'te monitor/quorum. Failover'da primary durdurulur, Sentinel yeni primary seçer, uygulama Sentinel üzerinden master'ı yeniden keşfeder. Cluster kurulumunda en az birden çok master/replica node ve cluster-aware client gerekir.",
    diagram: diagrams.ha,
    expert: "Sentinel quorum ve failover authorization koşullarını, network partition'da majority erişimini ve replication lag'i test edin. `WAIT` belirli replica ACK'lerini bekler ama güçlü consistency/zero-loss garantisi değildir. Sentinel konfigürasyonunu paylaşımlı kalıcı state gibi ele alın. Cluster slot migration, client support, multi-key same-slot/hash tag ve resharding planı gerekir.",
    lab: `
      <div class="warn"><b>Lab uyarısı:</b> Aşağıdaki topoloji üretim HA'sı değildir; tek hostta çalışan container'lar ortak host/disk/network arızasına açıktır. Primary portunu yalnızca loopback'e publish edin. İmaj etiketi doğrulanmış sabit sürüm olmalı; tüm Redis node'ları aynı sürümde tutulmalı.</div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`redis-egitimi/docker/compose-ha.yaml\` dosyasını oluşturun. \`&lt;major.minor.patch&gt;\` değerini sınıf öncesi doğrulanmış sabit Redis sürümüyle değiştirin.</label><pre><code>services:
  primary:
    image: redis:&lt;major.minor.patch&gt;
    command: [&quot;redis-server&quot;, &quot;--appendonly&quot;, &quot;yes&quot;]
    ports: [&quot;127.0.0.1:6381:6379&quot;]
  replica:
    image: redis:&lt;major.minor.patch&gt;
    command: [&quot;redis-server&quot;, &quot;--replicaof&quot;, &quot;primary&quot;, &quot;6379&quot;]
    depends_on: [primary]
  sentinel-1:
    image: redis:&lt;major.minor.patch&gt;
    command: [&quot;sh&quot;, &quot;-c&quot;, &quot;printf 'port 26379\\nsentinel monitor training-primary primary 6379 2\\nsentinel down-after-milliseconds training-primary 5000\\nsentinel failover-timeout training-primary 60000\\nsentinel parallel-syncs training-primary 1\\n' &gt; /tmp/sentinel.conf &amp;&amp; exec redis-server /tmp/sentinel.conf --sentinel&quot;]
    depends_on: [primary, replica]
  sentinel-2:
    image: redis:&lt;major.minor.patch&gt;
    command: [&quot;sh&quot;, &quot;-c&quot;, &quot;printf 'port 26379\\nsentinel monitor training-primary primary 6379 2\\nsentinel down-after-milliseconds training-primary 5000\\nsentinel failover-timeout training-primary 60000\\nsentinel parallel-syncs training-primary 1\\n' &gt; /tmp/sentinel.conf &amp;&amp; exec redis-server /tmp/sentinel.conf --sentinel&quot;]
    depends_on: [primary, replica]
  sentinel-3:
    image: redis:&lt;major.minor.patch&gt;
    command: [&quot;sh&quot;, &quot;-c&quot;, &quot;printf 'port 26379\\nsentinel monitor training-primary primary 6379 2\\nsentinel down-after-milliseconds training-primary 5000\\nsentinel failover-timeout training-primary 60000\\nsentinel parallel-syncs training-primary 1\\n' &gt; /tmp/sentinel.conf &amp;&amp; exec redis-server /tmp/sentinel.conf --sentinel&quot;]
    depends_on: [primary, replica]</code></pre><p>Compose starts one primary, one replica and three Sentinel processes on an isolated Compose network. Sentinel writes runtime state to its own container filesystem; a disposable lab can recreate it on restart. This is not production-ready configuration. Image tags all use one pinned version.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows · PowerShell</b>: \`docker\` klasörüne geçin.</label><pre><code>cd $HOME\\redis-egitimi\\docker</code></pre><p><b>macOS · Terminal</b>:</p><pre><code>cd ~/redis-egitimi/docker</code></pre></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Compose yapılandırmasını doğrulayın.</label><pre><code>docker compose -f compose-ha.yaml config</code></pre><p>Resolved YAML çıktısı; hata yok. Placeholder imaj etiketi yerine gerçek pinned version yazılmış olmalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: HA lab servislerini başlatın.</label><pre><code>docker compose -f compose-ha.yaml up -d</code></pre><p>\`up\` servisleri oluşturur, \`-d\` arka planda çalıştırır. \`depends_on\` readiness garantisi değildir; sentinel loglarında bağlantı ve master discovery oluşmasını bekleyin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: replikasyon durumunu doğrulayın.</label><pre><code>docker compose -f compose-ha.yaml exec primary redis-cli INFO replication</code></pre><p>Primary role \`master\`; connected replica count en az 1 beklenir. Replica'da \`role:slave\` (output label may be \`slave\` in some versions) veya güncel role değerini sürüme göre doğrulayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Sentinel master keşfini doğrulayın.</label><pre><code>docker compose -f compose-ha.yaml exec sentinel-1 redis-cli -p 26379 SENTINEL get-master-addr-by-name training-primary</code></pre><p>Primary service DNS name/address and port 6379 return expected.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: kontrollü failover için yalnızca disposable lab primary'yi durdurun.</label><pre><code>docker compose -f compose-ha.yaml stop primary</code></pre><p>Üretim/shared instance üzerinde çalıştırmayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Sentinel'in seçtiği yeni primary'yi sorgulayın; failover tamamlanana kadar tekrar edin.</label><pre><code>docker compose -f compose-ha.yaml exec sentinel-1 redis-cli -p 26379 SENTINEL get-master-addr-by-name training-primary</code></pre><p>Container IP'si ve 6379 portu döner; IP replica container'ına ait olmalı. Üç Sentinel, quorum 2 ve replica erişilebilir olmalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: lab'ı temizleyin.</label><pre><code>docker compose -f compose-ha.yaml down</code></pre><p>Container'ları ve network'ü kaldırır; volume tanımlandıysa \`-v\` olmadan veriyi saklar. Üretim verisine \`down -v\` uygulamayın.</p></div>
      <h3>Cluster lab: 3 master + 3 replica</h3>
      <div class="warn"><b>Cluster lab uyarısı:</b> Bu lab yalnızca aynı Docker Compose network'ündeki client'tan erişilir; host port publish edilmez. Redis Cluster redirect'leri node IP'lerini döndürür, bu nedenle host'tan doğrudan bağlanmayı varsaymayın. HA topolojisi önce <code>down</code> edilmelidir.</div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: <code>redis-egitimi/docker/compose-cluster.yaml</code> oluşturun; pinned Redis sürümünü değiştirin.</label><pre><code>x-redis-node: &amp;redis-node
  image: redis:&lt;major.minor.patch&gt;
  command: [&quot;redis-server&quot;, &quot;--cluster-enabled&quot;, &quot;yes&quot;, &quot;--cluster-config-file&quot;, &quot;nodes.conf&quot;, &quot;--cluster-node-timeout&quot;, &quot;5000&quot;, &quot;--appendonly&quot;, &quot;yes&quot;]
  expose: [&quot;6379&quot;, &quot;16379&quot;]
services:
  node-1: {&lt;&lt;: *redis-node}
  node-2: {&lt;&lt;: *redis-node}
  node-3: {&lt;&lt;: *redis-node}
  node-4: {&lt;&lt;: *redis-node}
  node-5: {&lt;&lt;: *redis-node}
  node-6: {&lt;&lt;: *redis-node}</code></pre><p>YAML anchor aynı imaj/ayarları paylaşır; her service ayrı container, IP ve writable working directory alır. Redis 6379 client portu ve 16379 cluster bus yalnızca Compose network içinde expose edilir; \`nodes.conf\` her node için ayrı container filesystem'indedir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows · PowerShell</b>: \`docker\` klasörüne geçin.</label><pre><code>cd $HOME\\redis-egitimi\\docker</code></pre><p><b>macOS · Terminal</b>:</p><pre><code>cd ~/redis-egitimi/docker</code></pre></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Compose yapılandırmasını doğrulayın.</label><pre><code>docker compose -f compose-cluster.yaml config</code></pre><p>Çözülmüş YAML ve 6 service görünür; hata olmamalı.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: 6 Redis node'unu başlatın.</label><pre><code>docker compose -f compose-cluster.yaml up -d</code></pre><p>\`docker compose ps\` ile altı node'un Up olduğunu doğrulayın; server readiness için gerekirse \`docker compose logs --tail 20 node-1\` inceleyin.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: cluster slot\'larını 3 master ve 3 replica arasında dağıtın.</label><pre><code>docker compose -f compose-cluster.yaml exec -T node-1 redis-cli --cluster create node-1:6379 node-2:6379 node-3:6379 node-4:6379 node-5:6379 node-6:6379 --cluster-replicas 1 --cluster-yes</code></pre><p>\`--cluster-replicas 1\` her master'a bir replica atar; \`--cluster-yes\` interaktif onayı atlar. Beklenen: slot assignment completed ve cluster join success. Bu sadece lab network'ünde çalışır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: cluster durumunu doğrulayın.</label><pre><code>docker compose -f compose-cluster.yaml exec node-1 redis-cli --cluster check node-1:6379</code></pre><p>16384 slot covered ve 3 master/3 replica görünmeli; \`cluster_state:ok\` beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: cluster-aware CLI redirect'ini doğrulayın.</label><pre><code>docker compose -f compose-cluster.yaml exec node-1 redis-cli -c SET cluster:demo hello</code></pre><p>\`-c\` MOVED yönlendirmesini takip eder; \`OK\` beklenir. \`GET cluster:demo\` ile değeri doğrulayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Cluster lab container'larını durdurup kaldırın.</label><pre><code>docker compose -f compose-cluster.yaml down</code></pre><p>Lab verisi container filesystem'inde olduğundan container kaldırılınca temizlenir; production volume üzerinde bu komutu çalıştırmayın.</p></div>`,
    expected: "Primary `INFO replication` replica bağlantısı; Sentinel primary keşfi; üç Sentinel ve quorum düzgünse primary durdurulduktan sonra Sentinel yeni primary adresi döndürür. Cluster lab'ında 16384 slot, 3 master/3 replica ve cluster_state:ok doğrulanır.",
    errors: [["NOQUORUM Not enough good replicas to promote", "Replica/uygun sentinel sayısı ya da quorum yok.", "Sentinel sayısını 3 ve quorum'u 2 yapın; her container'ın birbirine eriştiğini ve sentinel state/config writable olduğunu doğrulayın."], ["ERR Invalid argument(s)", "Sentinel config formatı veya monitor target yanlış.", "Config satırlarını, DNS service name ve quorum değerini doğrulayın; logları inceleyin."], ["(error) NOAUTH Authentication required", "Primary/Sentinel ACL kimlik bilgileri tutarsız.", "Lab'da auth kapalı/izole olmalı ya da primary, replica, Sentinel ve client için auth tutarlı biçimde tanımlanmalı."], ["MOVED ...", "Cluster-aware olmayan client/yanlış endpoint.", "Cluster client kullanın ve her node'un advertised endpoint'lerine ağ erişimini sağlayın."], ["Could not connect to Redis ...", "Docker Compose servisi/network hazır değil.", "`docker compose ps` ve servis loglarını kontrol edin; depends_on readiness sağlamaz, healthcheck/ready wait gerekir."]],
    easy: "Replikasyon tek başına neyi çözmez?", ea: "Primary failure detection/failover'ı otomatik çözmez; Sentinel veya orchestration gerekir. Async replication veri kaybı riskini de ortadan kaldırmaz.",
    medium: "Sentinel ile Cluster arasındaki ana fark?", ma: "Sentinel mevcut dataset primary'si için HA/failover/discovery; Cluster sharding + HA ve cluster-aware client yönlendirmesi.",
    hard: "Tüm HA container'ları aynı laptop'ta. Bu hangi failure domain'i kapsamaz?", ha: "Host, disk, güç, işletim sistemi ve ortak network arızalarını kapsamaz; production dağıtımı failure domain'lere yayılmalıdır.",
    checklist: ["Async replication lag/loss trade-off'u anlaşıldı", "Sentinel quorum ve client discovery ayrıldı", "Cluster slot/client yönlendirmesi biliniyor", "Lab tek host HA değildir", "Failover sonrası yazma/okuma test planı var"],
  },
  {
    n: 9, file: "09-cache-kullanimi.html", title: "Redis and Cache Usage", short: "Cache kullanımı",
    duration: "100 dk", level: "Orta → İleri",
    goals: ["Cache-aside/write-through/write-behind trade-off'larını kıyaslamak", "TTL ve invalidation stratejisi tasarlamak", "Stampede, penetration ve avalanche risklerini azaltmak", "Python ile çalıştırılabilir cache-aside örneği oluşturmak"],
    prereq: "Sayfa 07 Python sanal ortamı ve Redis servisi hazır; `requirements.txt` içinde sabit redis-py sürümü var.",
    opening: "“Cache'e veri koymak kolay, doğru zamanda geçersiz kılmak zor. Ürün kataloğu örneğinde stale verinin kabul edilebilir süresini iş birimiyle konuşmadan TTL seçmeyeceğiz.”",
    questions: ["Cache hit oranı tek başına cache başarısı mıdır?", "Boş DB sonucunu cache'lemek ne zaman gerekir?", "Bir milyon key aynı anda expire olursa ne olur?"],
    traps: "Cache hit ratio yüksek olsa bile stale/security-sensitive data riski olabilir. TTL yoksa bellek sınırsız büyüyebilir. Negative caching kısa TTL ister. Write-behind veri kaybı/flush garantisi ve retry ile birlikte tasarlanmalıdır.",
    why: "Ürün kataloğunda aynı ürün kaydı çok okunur, az değişir. Cache-aside DB yükünü düşürür; fakat ilk miss'te kaynak DB'ye gider ve yazma/invalidation sıralaması tutarlılığı etkiler.",
    what: "Cache-aside: uygulama cache'i okur, miss'te kaynağı okuyup cache'e koyar. Write-through: yazma cache ve source ile senkron; write-behind: cache'e yazıp source'u asenkron güncelleme riski taşır. Stampede aynı key miss'inde çoklu DB isteği; penetration var olmayan key yoğunluğu; avalanche çoklu eşzamanlı expire/failure dalgasıdır.",
    how: "Python fonksiyonu key'i okur, JSON parse eder; miss'te demo source function, JSON set EX. TTL'ye jitter eklenebilir. Invalidation write sonrası DEL veya versioned key/event ile yapılır. Lab source DB yerine sabit demo fonksiyonu kullanır; production DB transaction'ı simüle etmez.",
    diagram: diagrams.cache,
    expert: "Cache key auth/tenant/locale/schema boyutlarını doğru kapsamalı, PII/secret cache policy'si olmalı. Dogpile lock/single-flight, bounded DB concurrency, randomized TTL, stale-while-revalidate; negative cache ve rate limiting ayrı kontrollerdir. Write-through iki sistem arasında dağıtık transaction garantisi sağlamaz. Cache outage için fail-open/fail-closed kararı route ve risk bazlı verilmelidir.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`redis-egitimi/python/cache_demo.py\` oluşturun. venv etkin ve redis-py kurulmuş olmalı.</label><pre><code>from __future__ import annotations

import json
import os
import random
from typing import Any

import redis


def load_product_from_source(product_id: int) -&gt; dict[str, Any]:
    # Lab stand-in; replace with a bounded database call in an application.
    return {&quot;id&quot;: product_id, &quot;name&quot;: &quot;Kahve&quot;, &quot;price_cents&quot;: 2499}


def get_product(client: redis.Redis, product_id: int) -&gt; dict[str, Any]:
    key = f&quot;catalog:product:{product_id}&quot;
    cached = client.get(key)
    if cached is not None:
        return json.loads(cached)
    product = load_product_from_source(product_id)
    ttl = 300 + random.randint(0, 30)
    client.set(key, json.dumps(product), ex=ttl)
    return product


def main() -&gt; None:
    client = redis.Redis.from_url(
        os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;),
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
        max_connections=20,
    )
    try:
        product = get_product(client, 42)
        print(&quot;Product:&quot;, product)
        print(&quot;TTL:&quot;, client.ttl(&quot;catalog:product:42&quot;))
        # Simulate a source update followed by cache invalidation.
        client.delete(&quot;catalog:product:42&quot;)
        print(&quot;Invalidated:&quot;, client.exists(&quot;catalog:product:42&quot;))
    finally:
        client.close()


if __name__ == &quot;__main__&quot;:
    main()</code></pre><p>Cache hit GET; miss calls source stand-in then caches JSON; random TTL spreads expiration; invalidation follows the hypothetical source write. Print/Run Python File. Output contains product dict, positive TTL 300–330 and invalidated 0.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code Terminal</b>: venv activate if needed, then run.</label><pre><code>python cache_demo.py</code></pre><p>PowerShell/macOS use same command once venv is active. \`ModuleNotFoundError\` means wrong interpreter or dependencies missing.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: add a simple negative cache test to the lab in \`labs/cache-notes.txt\` (File → New File); record what value should be cached for product-not-found, and its shorter TTL versus normal product cache.</label><p>This is a design exercise; do not cache raw 500 errors or authorization failures as “not found.”</p></div>`,
    expected: "Output `Product: {'id': 42, ...}`, TTL integer 300–330, then `Invalidated: 0`. Second run after invalidation is a cache miss again.",
    errors: [["json.decoder.JSONDecodeError: ...", "Cache key'de beklenmeyen/önceki schema formatı var.", "Schema versionlı key kullanın (`catalog:v1:product:42`); parse hatasını loglayıp source fallback kararını açıkça uygulayın, bozuk key'i kontrollü silin."], ["redis.exceptions.TimeoutError: Timeout connecting to server", "Redis erişimi/latency sorunu.", "Cache outage politikasını uygulayın; sınırsız retry ile DB'yi ezmeyin; bounded timeout ve concurrency limit kullanın."], ["DB timeout / too many connections during cache miss", "Stampede veya fallback request fan-out.", "Per-key single-flight/lock, stale value, request coalescing ve source DB concurrency cap tasarlayın."], ["Cache key returns another tenant's data", "Key omits tenant/authorization dimensions.", "Tenant/scope identifier key schema'ya ekleyin; authorization cache boundary testleri yazın; mevcut key'leri invalidate edin."]],
    easy: "Cache-aside miss sırası nedir?", ea: "Cache GET → miss হলে source read → cache SET with TTL → response.",
    medium: "Stampede için iki önlem?", ma: "Per-key request coalescing/lock, TTL jitter, stale-while-revalidate, DB concurrency limit.",
    hard: "Fiyat değişikliğinden sonra eski fiyat en fazla 60 sn görünebilir. TTL dışında hangi invalidation düşünülür?", ha: "Source write commit sonrası key DEL, versioned key, transactional outbox/event invalidation; failure/retry ve race sıralaması tanımlanmalı.",
    checklist: ["Cache-aside akışı kodlandı", "TTL+jitter ve invalidation denendi", "Stampede/penetration/avalanche ayrımı biliniyor", "Tenant-aware key tasarlandı", "Cache outage stratejisi belirlendi"],
  },
  {
    n: 10, file: "10-pubsub-streams.html", title: "Redis and the Pub/Sub Model", short: "Pub/Sub & Streams",
    duration: "90 dk", level: "Orta",
    goals: ["Pub/Sub fan-out ve teslim semantiğini açıklamak", "Streams ve consumer group ile Pub/Sub'u kıyaslamak", "Python publisher/subscriber uygulaması çalıştırmak", "Mesaj kaybı ve ack gereksinimine göre seçim yapmak"],
    prereq: "Python venv/redis-py ve Redis Compose servisi hazır. İki terminal/VS Code terminal paneli kullanabilmeli.",
    opening: "“Canlı bildirim ile dayanıklı iş kuyruğu aynı ihtiyaç değil. Subscriber çevrimdışıyken mesajı kaçırması sorun değilse Pub/Sub; sonradan tüketim, ack ve yeniden işleme gerekiyorsa Streams'i düşünelim.”",
    questions: ["Subscriber çalışmıyorken publish edilen Pub/Sub mesajı sonra alınır mı?", "Consumer group ack etmezse Stream mesajı ne olur?", "Birden çok consumer aynı mesajı mı yoksa farklı mesajları mı alır?"],
    traps: "Pub/Sub delivery at-most-once ve subscriber'lar online değilse mesaj kaybolur. Streams'te XACK retention/silme demek değildir. Consumer group PEL büyüyebilir; abandoned pending entries için reclaim politikası gerekir.",
    why: "E-ticaret uygulamasında fiyat değişikliği anında dashboard'a duyurulabilir; kritik sipariş işleme için subscriber kısa süre offline olsa bile olayın saklanması gerekir. Bu iki durum aynı mesajlaşma semantiğini istemez.",
    what: "Redis Pub/Sub channel üzerinden yayın yapar; subscriber'lar o an dinliyorsa mesajı alır, backlog yoktur. Redis Stream kayıtları ID ile saklar; consumer group load distribution, pending list ve ack sağlar. Stream retention/trim politikası ayrıca ayarlanır.",
    how: "Python script'i mode argümanıyla `sub` veya `pub` seçer. İki terminalde subscriber önce başlar, publisher sonra publish eder. Streams CLI demo XADD/group/read/ack ile tekrar okunabilir durable record modelini gösterir.",
    diagram: diagrams.messaging,
    expert: "Pub/Sub subscriber backpressure/slow consumer ve reconnect gap yönetmez; critical events için durable broker/Stream/outbox düşünün. Streams retention memory'yi sınırlar; trimming pending mesajları etkileyebilir. Consumer idempotency ve dedupe gerekir; Redis ack iş mantığı commit'iyle atomik değilse tekrar/çift uygulama riski vardır.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`redis-egitimi/python/pubsub_demo.py\` dosyasını tam içerikle oluşturun.</label><pre><code>from __future__ import annotations

import os
import sys

import redis


def main() -&gt; None:
    if len(sys.argv) != 2 or sys.argv[1] not in {&quot;sub&quot;, &quot;pub&quot;}:
        raise SystemExit(&quot;Usage: python pubsub_demo.py sub|pub&quot;)
    client = redis.Redis.from_url(
        os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;),
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )
    try:
        if sys.argv[1] == &quot;sub&quot;:
            pubsub = client.pubsub()
            pubsub.subscribe(&quot;training:product-events&quot;)
            print(&quot;Listening on training:product-events (Ctrl+C to stop)&quot;)
            for message in pubsub.listen():
                if message[&quot;type&quot;] == &quot;message&quot;:
                    print(&quot;Received:&quot;, message[&quot;data&quot;])
        else:
            count = client.publish(
                &quot;training:product-events&quot;,
                &quot;product:42:price-updated&quot;,
            )
            print(&quot;Subscribers reached:&quot;, count)
    finally:
        client.close()


if __name__ == &quot;__main__&quot;:
    main()</code></pre><p>Mode argument validates command; subscriber opens PubSub and listens; publisher returns number of subscribers reached; always close pool on process exit. VS Code run or terminal executes below.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows PowerShell/macOS Terminal 1</b>: venv activate, subscriber başlatın.</label><pre><code>python pubsub_demo.py sub</code></pre><p>\`Listening ...\` beklenir; süreç açık kalır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows PowerShell/macOS Terminal 2</b>: aynı venv/klasörde yayın yapın.</label><pre><code>python pubsub_demo.py pub</code></pre><p>\`Subscribers reached: 1\` ve Terminal 1'de \`Received: product:42:price-updated\` beklenir. Count 0 ise subscriber hazır değil.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Terminal 1</b>: Ctrl+C ile subscriber'ı durdurun. <b>Terminal 2</b>: yayıncıyı tekrar çalıştırın.</label><p>Abone yokken count 0; eski mesaj subscriber'a sonradan ulaşmaz.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: Redis Streams farkını CLI ile görün.</label><pre><code>docker exec -it redis-lab redis-cli
XADD training:events * type price-updated product_id 42
XGROUP CREATE training:events catalog-workers 0 MKSTREAM
XREADGROUP GROUP catalog-workers worker-1 COUNT 1 STREAMS training:events &gt;</code></pre><p>Stream ID ve event; consumer group yeni mesajı döndürür. \`XACK training:events catalog-workers &lt;ID&gt;\` ile gerçek çıktıda ID'yi kopyalayıp ack edin.</p></div>`,
    expected: "Subscriber önce başlatıldığında publisher `Subscribers reached: 1`; subscriber Received mesajı. Abone yokken count 0 ve backlog yoktur. Stream readgroup kaydı döner, ack PEL'den çıkarır.",
    errors: [["Subscribers reached: 0", "Publish anında aktif subscriber yok.", "Önce subscriber `Listening...` çıktısına ulaşsın; bu davranış Pub/Sub semantiğidir."], ["redis.exceptions.ConnectionError ...", "Redis servisi/portu yanlış.", "`docker compose ps`, PING ve `REDIS_URL` kontrolü."], ["BUSYGROUP Consumer Group name already exists", "Stream group ikinci çalıştırmada zaten var.", "`XINFO GROUPS` ile varlığını kontrol edin; lab akışında tekrar create etmeyin."], ["Pending entries list grows continuously", "Consumer XACK etmiyor veya worker çökmüş.", "PEL'i ölçün; idle entry claim/retry ve dead-letter politikası tasarlayın; yalnızca silerek hatayı gizlemeyin."]],
    easy: "Pub/Sub mesajı subscriber offline iken saklanır mı?", ea: "Hayır.",
    medium: "Stream consumer group mesajı başarıyla işlediğini nasıl işaretler?", ma: "`XACK` ile; bu, retention/trim politikasından ayrı bir konudur.",
    hard: "Ödeme event'inde subscriber restart sonrası kayıp kabul edilemez. Pub/Sub yeterli mi?", ha: "Hayır; Stream consumer group/outbox veya durable broker, retry/ack, idempotency ve retention tasarlayın.",
    checklist: ["Publisher/subscriber çalıştı", "Subscriber offline iken mesaj kaybı gözlendi", "Stream consumer group ack farkı anlaşıldı", "Idempotent handler/retention ihtiyacı belirlendi"],
  },
  {
    n: 11, file: "11-lua-scripting.html", title: "Redis and Lua Scripting", short: "Lua scripting",
    duration: "100 dk", level: "İleri",
    goals: ["EVAL/EVALSHA ve script cache davranışını açıklamak", "Lua script'in atomikliğini ve blocking riskini değerlendirmek", "Python'dan script çağırmak", "Basit token-window rate limiter ve lock kalıbını uygulamak"],
    prereq: "Redis CLI, Python venv/redis-py hazır. Script'leri önce lab instance'ında test edin.",
    opening: "“Lua script birden fazla Redis komutunu sunucu tarafında tek atomik işlem gibi yürütmemizi sağlar. Ancak atomiklik ücretsiz değildir: script çalışırken diğer komutlar bekler; küçük ve bounded script yazacağız.”",
    questions: ["Script atomikse neden kısa tutulmalı?", "EVALSHA NOSCRIPT dönerse client ne yapmalı?", "Dağıtık lock'ı sadece SET NX ile bırakmak neden tehlikeli?"],
    traps: "Lua atomicity isolation'dır, rollback değil; script error sonrası önceki yazılar kalabilir. `KEYS` array script argument'tır, tüm keyspace scan değildir. Script key'leri Cluster'da aynı hash slot'a düşmeli. Lock release owner token compare-and-delete yapmadan DEL etmeyin.",
    why: "Rate limit kontrolünde GET count, koşul, INCR ve TTL ayrı round-trip olsa arada race olabilir. Lua ile tek server-side script execution içinde check/update yapılabilir.",
    what: "`EVAL script numkeys key... arg...` script'i çalıştırır; `EVALSHA` SHA1 cache referansı kullanır. Script cache restart/flush sonrası kaybolabilir; NOSCRIPT recovery gerekir. Redis 7 Functions API'si de vardır fakat sürüm/operational model ayrı.",
    how: "Python redis-py `register_script` kullanır; script key/args ayrılır. Lab script fixed-window counter key'i increment edip ilk istek TTL koyar. Lock demo token compare+delete Lua ile güvenli release yapar. Rate limiter demo distributed sliding window değildir.",
    expert: "Lua script süre/boyut limitlerini workload'a göre ölçün; uzun loop/blocking script tüm instance latency'sini etkiler. Rate limit key TTL ve atomicity; clock source/server time, policy, burst semantics; cluster hash tags gerekir. Lock TTL expiry, fencing token, lease renewal ve downstream fencing olmadan genel distributed lock doğruluk garantisi sayılmaz. Mümkünse Redlock/consensus tasarım iddialarını iş gereksinimi ve failure modeline göre inceleyin.",
    lab: `
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: \`redis-egitimi/python/lua_demo.py\` oluşturun; kod tamdır.</label><pre><code>from __future__ import annotations

import os
import secrets
import time

import redis


RATE_LIMIT = &quot;&quot;&quot;
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
&quot;&quot;&quot;

RELEASE_LOCK = &quot;&quot;&quot;
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
&quot;&quot;&quot;


def main() -&gt; None:
    client = redis.Redis.from_url(
        os.getenv(&quot;REDIS_URL&quot;, &quot;redis://localhost:6379/0&quot;),
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )
    try:
        rate_limit = client.register_script(RATE_LIMIT)
        result = rate_limit(
            keys=[&quot;rate:demo:user-7&quot;],
            args=[60],
        )
        print(&quot;Rate window count/ttl:&quot;, result)
        token = secrets.token_urlsafe(24)
        acquired = client.set(&quot;lock:demo:job-1&quot;, token, nx=True, ex=10)
        print(&quot;Lock acquired:&quot;, bool(acquired))
        if acquired:
            time.sleep(0.1)  # Simulate a short, bounded critical section.
            release = client.register_script(RELEASE_LOCK)
            print(&quot;Lock released:&quot;, release(keys=[&quot;lock:demo:job-1&quot;], args=[token]))
    finally:
        client.close()


if __name__ == &quot;__main__&quot;:
    main()</code></pre><p>RATE_LIMIT increments counter and sets expiry only at first hit; returns count/TTL. Lock token is random; SET NX EX acquires only if absent; Lua compare/delete avoids deleting another owner's lock. It is pedagogical, not complete fencing/lease system.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows PowerShell/macOS Terminal</b>: venv aktifken çalıştırın.</label><pre><code>python lua_demo.py</code></pre><p>Beklenen \`Rate window count/ttl: [1, 60]\` (TTL timing may be 59) and \`Lock acquired: True\`, \`Lock released: 1\`. Re-run counter count increments.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: script cache miss davranışını izole lab instance'ında simüle edin.</label><pre><code>docker exec redis-lab redis-cli SCRIPT FLUSH</code></pre><p>Yalnızca disposable lab'ta çalıştırın; script cache'i temizler. Ardından \`python lua_demo.py\` tekrar çalıştırıldığında redis-py \`register_script\` script'i tekrar yükleyip çalıştırmalıdır. Production/shared instance'ta \`SCRIPT FLUSH\` kullanmayın.</p></div>
      <div class="info">Bu demo fixed-window counter'dır; pencere sınırında burst iki katına yaklaşabilir. \`RATE_LIMIT\` key tenant/user identity'sini içerir. Cluster'da \`rate:{user-7}:window\` gibi braces ile aynı-slot key planlayın. Script'leri küçük tutun, load test edin, source file olarak version-control edin.</div>`,
    expected: "İlk `Rate window count/ttl` `[1, ~60]`; lock acquisition true; release integer 1. Sonraki run count artar.",
    errors: [["redis.exceptions.NoScriptError: No matching script. Please use EVAL.", "Server script cache restart/flush sonrası boş.", "redis-py register_script normalde NOSCRIPT fallback yapar; kullanılan API/sürümü doğrulayın, gerekli yerde EVAL fallback uygulayın."], ["ERR Error running script ...", "Lua runtime error, argument/type mismatch.", "Redis error message/script line inspect; key/ARGV arity and numeric value validate."], ["MOVED ...", "Script key cross-slot/cluster routing unsupported.", "Cluster-aware client; all KEYS same hash slot using hash tag."], ["Lock acquired: False", "Lock key already owned by previous run.", "TTL expire wait or inspect owner safely; never blindly DEL someone else's lock."], ["Rate window TTL: -1", "Counter exists without expected expire; script failed between operations or different key usage.", "Lab key inspect and cleanup; production script ensures TTL repair strategy and alert."]],
    easy: "EVALSHA cache miss tipik olarak hangi hatayı verir?", ea: "NOSCRIPT; script body ile EVAL fallback/load gerekir.",
    medium: "Lock'u neden random token ile compare-and-delete yaparız?", ma: "Süresi dolan eski owner, lock'u yeni owner aldıktan sonra yanlışlıkla silemesin diye.",
    hard: "Lua script atomik ama ortasında runtime error oluşursa tüm yazılar rollback olur mu?", ha: "Hayır. Atomic execution diğer komutların araya girmemesini sağlar; SQL rollback semantiği değildir.",
    checklist: ["EVAL/EVALSHA ve NOSCRIPT anlaşıldı", "Script bounded/small", "Fixed window rate limiter çalıştı", "Lock token-safe release uygulandı", "Distributed lock sınırlamaları biliniyor"],
  },
  {
    n: 12, file: "12-veritabani-optimizasyonu.html", title: "Database Optimization with Redis", short: "Veritabanı optimizasyonu",
    duration: "105 dk", level: "Orta → İleri",
    goals: ["DB read yükünü cache/pattern ile azaltmak", "Counter, leaderboard, session ve rate-limit desenlerini kıyaslamak", "SLOWLOG, latency ve memory metriklerini incelemek", "Benchmark'ı kontrollü ve yorumlanabilir biçimde yapmak"],
    prereq: "Redis Compose labı ve Python örnekleri hazır. Benchmark yalnızca izole eğitim instance'ında çalıştırılmalı.",
    opening: "“Önce ölçüm, sonra optimizasyon. Redis'e geçmek veritabanı yükünün nedenini anlamanın yerine geçmez. Cache hit, backend latency ve staleness'i aynı dashboard'da değerlendireceğiz.”",
    questions: ["QPS artarken tail latency yükselirse neyi kontrol edersiniz?", "Cache hit ratio ölçümü hangi zararı gizleyebilir?", "Bigger Redis memory neden her zaman daha hızlı değildir?"],
    traps: "`redis-benchmark` boş local instance'ta kıyas verir; production workload tahmini değildir. SLOWLOG command execution time'ı ölçer, client/network toplamını değil. `MONITOR` ağırdır ve hassas payload gösterebilir. INFO metrikleri tek başına tracing değildir.",
    why: "Popüler katalog sorgularını cache'lemek DB read yükünü azaltabilir. Sayaç, leaderboard, session ve rate limit gibi kalıplar farklı tutarlılık/TTL ihtiyaçlarına sahiptir. Gerçek optimizasyon için source DB latency ve Redis latency birlikte ölçülür.",
    what: "Read-through/cache-aside query results; `INCRBY` atomic counters; ZSET leaderboard; TTL session; Lua/INCR rate limiter. Redis `SLOWLOG GET`, `INFO stats`, `INFO memory`, `MEMORY USAGE`, `LATENCY` araçları sunar. `redis-benchmark` synthetic workload üretir.",
    how: "CLI ile INFO/SLOWLOG/MEMORY gözle; fixed small benchmark koş; sonuçta throughput ve latency dağılımını environment/tuning bilgisiyle kaydet. Key schema TTL/eviction ve payload size ile eşleştir. Production observability için application-side latency, error, cache hit/miss ve DB metrics ekle.",
    expert: "Hot key, large key, big pipeline, eviction, allocator fragmentation, fork/COW persistence etkisi latency spike yaratabilir. Benchmark concurrency, payload, pipelining, TLS, network, persistence, dataset size ve client count'e göre tasarlanmalı. p99/p999 ve error rate ölçün; mean yeterli değildir. DB offload sonrası write amplification/invalidation yükü ve cache miss DB surge'ünü kapasite test edin.",
    lab: `
      <h3>Yaygın uygulama kalıpları</h3>
      <table><thead><tr><th>Kalıp</th><th>Redis yapısı / işlem</th><th>Dayanıklılık ve doğruluk kararı</th></tr></thead><tbody>
      <tr><td>Cache edilmiş sorgu sonucu</td><td>String JSON + TTL; source DB miss read</td><td>Cache miss DB'ye yük bindirir; key schema, invalidation ve staleness budget tanımlayın.</td></tr>
      <tr><td>Sayaç</td><td>String \`INCRBY\` veya Lua</td><td>Atomik sayaç; overflow, dedupe ve persistence ihtiyacını değerlendirin.</td></tr>
      <tr><td>Leaderboard</td><td>Sorted Set \`ZADD\` / \`ZREVRANGE\`</td><td>Member uniqueness, eşit skor tie policy, retention ve büyük set maliyetini ölçün.</td></tr>
      <tr><td>Session</td><td>Hash/String + TTL</td><td>TTL, logout invalidation, fixation/authorization, PII encryption/access policy belirleyin.</td></tr>
      <tr><td>Rate limit</td><td>\`INCR\` + expiry veya Lua</td><td>Fixed/sliding window ve burst semantiği; key cardinality, TTL, cluster slot ve clock kararları.</td></tr>
      </tbody></table>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: lab key pattern'lerini ve key sayısını inceleyin.</label><pre><code>docker exec redis-lab redis-cli INFO stats
docker exec redis-lab redis-cli INFO memory
docker exec redis-lab redis-cli SLOWLOG GET 10</code></pre><p>INFO stats keyspace hit/miss gibi sayaçlar; memory allocated/peak; SLOWLOG son yavaş komutlar (başlangıçta boş olabilir). Redis sürümü/ACL'e göre alanlar değişebilir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: belirli key'in bellek maliyetini görün.</label><pre><code>SET lab:large-value &quot;sample-payload&quot;
MEMORY USAGE lab:large-value
DEL lab:large-value</code></pre><p>Byte estimate döner; value boyutuna göre küçük ama nonzero.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: latency monitor durumunu okuyun.</label><pre><code>docker exec redis-lab redis-cli LATENCY LATEST
docker exec redis-lab redis-cli LATENCY DOCTOR</code></pre><p>Event yoksa empty list/no spike normaldir. \`LATENCY DOCTOR\` server config'te latency monitor threshold enabled olmasını gerektirebilir; config/policy doğrulamadan açmayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows PowerShell/macOS Terminal</b>: synthetic benchmark'i yalnızca lab container üzerinde çalıştırın.</label><pre><code>docker exec redis-lab redis-benchmark -n 10000 -c 10 -t get,set</code></pre><p>\`-n\` toplam request sayısı, \`-c\` client concurrency, \`-t\` test komutları. Throughput ve latency distribution percentile'ları görünür. Sonuç host/Redis sürümüne bağlıdır; production SLO değildir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: RedisInsight varsa keyspace/memory'yi UI'da gözlemleyin; yoksa CLI çıktısını \`labs/metrics-notes.txt\` dosyasına kaydedin (VS Code → File → New File).</label><p>Not edin: Redis sürümü, machine/architecture, imaj etiketi, persistence ayarı, request count/concurrency, p50/p95/p99 ve hatalar. \`MONITOR\` üretimde kullanmayın; komut içeriğini açığa çıkarabilir ve yük ekler.</p></div>`,
    expected: "INFO stats/memory alanları; SLOWLOG boş veya kısa komut kaydı; LATENCY event var/yok; benchmark SET/GET ops/sec ve percentile summary.",
    errors: [["ERR unknown command 'LATENCY'", "Redis sürümü/özellik farkı.", "Server version ve HELP LATENCY doğrulayın; desteklenmiyorsa INFO/SLOWLOG/client-side latency kullanın."], ["(error) NOAUTH Authentication required", "ACL izinleri eksik.", "Sadece yetkili lab credentials ve gerekli read-only commands kullanın."], ["OOM command not allowed ...", "Instance memory limit dolu.", "Benchmark'i durdurun; lab key'lerini temizleyin; memory/eviction inceleyin."], ["benchmark reports high ops/sec but application remains slow", "Synthetic benchmark network, serialization, contention, DB waits veya tail latency kapsamıyor.", "End-to-end tracing, p95/p99, client pool, payload size, DB and cache metrics ölçün."]],
    easy: "SLOWLOG, client-server ağ gecikmesini içerir mi?", ea: "Hayır; server'da komut yürütme süresini ölçer.",
    medium: "Benchmark sonucunu yeniden üretmek için raporda hangi ayarlar tutulmalı?", ma: "Redis version/config, host/CPU/architecture, network, dataset/payload, concurrency, request count, persistence, client, pipeline/TLS.",
    hard: "Cache hit ratio %99 ama DB outage sırasında sistem çöktü. Hangi tasarım boşluğu olası?", ha: "Miss/fallback path için DB concurrency cap, circuit breaker/degradation, stale serving ve controlled failover planı eksik olabilir; yüzde tek başına koruma sağlamaz.",
    checklist: ["INFO/SLOWLOG/MEMORY/LATENCY incelendi", "Benchmark doğru sınırlarla raporlandı", "p95/p99 ve end-to-end latency dikkate alındı", "Cache hit/miss + DB yükü korelasyonu planlandı"],
  },
  {
    n: 13, file: "13-guvenlik-kapanis.html", title: "Security Principles in Redis + Kapanış", short: "Güvenlik & kapanış",
    duration: "120 dk", level: "Tüm seviyeler",
    goals: ["ACL kullanıcıları ve least privilege ilkesini uygulamak", "Ağ izolasyonu, TLS ve secret yönetimini açıklamak", "Tehlikeli komut ve Docker hardening risklerini tanımak", "Final lab ve kapanış kontrol listesini tamamlamak"],
    prereq: "Tüm sayfalar veya konu özeti tamamlanmış; Docker laboratuvarı; eğitim sonrası kaldırılabilecek disposable veriler. Gerçek sırları lab'a koymayın.",
    opening: "“Redis'i ağa açıp sonra parola eklemek güvenlik planı değildir. Önce ağ erişimini daraltıyor, sonra kimliği ve komut/key yetkisini en aza indiriyoruz. Son bölümde her ekibin kendi hardening maddesini netleştireceğiz.”",
    questions: ["Bir parola Redis'i internetten erişime karşı tek başına korur mu?", "Default user'a full access vermek neden ACL değildir?", "Dangerous command rename ile ACL block arasındaki trade-off nedir?"],
    traps: "Port publish `0.0.0.0` tüm host network arayüzlerine açabilir; localhost binding kullanın. Secret CLI argümanı/shell history/log içine düşebilir. `requirepass` eski uyumluluk biçimidir; ACL ile user-based kontrol tercih edin. TLS Redis server/client config ve cert lifecycle gerektirir; Docker bridge içi plain text'i network trust boundary'si olmadan güvenli varsaymayın.",
    why: "Redis default olarak güvenilmeyen ağa açılmamalı. Yetkisiz erişim veri sızdırma, değiştirme, silme ve kötüye kullanım yaratabilir. Ağ izolasyonu, ACL least privilege, TLS ve güvenli container deployment birlikte uygulanır.",
    what: "ACL user, command category/individual command ve key pattern yetkisi belirler. `requirepass` default user authentication'ıdır; ACL daha ince kontrol sunar. TLS in-transit encryption'dır. Dangerous commands (FLUSHALL, CONFIG, DEBUG, MODULE vb.) erişim sınırlandırılmalıdır. Docker image/volume/user/network/secrets da attack surface'tir.",
    how: "Lab'da geçici Redis instance üzerinde least-privilege kullanıcı oluşturulur, auth doğrulanır, yetkisiz komut/key erişimi denenir; sonra ACL user kaldırılır. Çalışma sonunda checklist, komut kopya kağıdı ve final proje değerlendirmesi yapılır. Prod credential'ları sayfalara/koda koymayın.",
    expert: "ACL command/key/channel scopes ve default user disable/rename kararını uygulama compatibility testleriyle uygulayın. Redis protected mode/firewall/TLS/ACL katmanlı kontroldür. TLS client cert/auth, cert rotation ve termination boundary'si tasarlanmalı. Container rootless/non-root, read-only FS, capabilities, image pinning/scanning, resource limits, private networks, persistent volume backup/permissions, secrets manager ve audit logging gerekir. `FLUSH*`, `CONFIG`, `MODULE`, `DEBUG`, `KEYS`, `MONITOR`, `SHUTDOWN` gibi komutları görev bazında deny edin; ACL category adlarını sürümde doğrulayın.",
    lab: `
      <div class="warn"><b>Güvenlik sınırı:</b> Bu lab sadece loopback'e publish edilen, disposable eğitim container'ında yapılır. Parolayı gerçek secret ile değiştirmeyin; komut satırına gerçek credential koymayın. ACL syntax'i kullanılan Redis sürümünde doğrulayın. Managed service'te ACL/config değişikliği yetkili süreçten yürütülür.</div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: isolated lab Redis CLI'ını açın.</label><pre><code>docker exec -it redis-lab redis-cli</code></pre><p>Yalnızca disposable eğitim instance'ına bağlandığınızı doğrulayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: least-privilege lab user oluşturun.</label><pre><code>ACL SETUSER lab-reader reset on &gt;training-only-secret ~catalog:* +get +mget +ping</code></pre><p>ACL SETUSER user'i resetler, etkinleştirir, lab-only password, key pattern \`catalog:*\`, GET/MGET/PING komut izni verir. Gerçek ortamda secret command history'e girmemeli; ACL SETUSER response OK beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: ACL user listesini okuyun.</label><pre><code>ACL LIST</code></pre><p>\`lab-reader\` kaydı görünür.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI</b>: ACL user kapsamını okuyun.</label><pre><code>ACL GETUSER lab-reader</code></pre><p>User enabled, key pattern ve command permissions görünür.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: ACL user ile izin verilen PING komutunu deneyin.</label><pre><code>docker exec redis-lab redis-cli --user lab-reader --pass training-only-secret PING</code></pre><p>\`PONG\` beklenir. Bu örnek parola yalnızca disposable lab içindir; shell history riskini öğrencilerle tartışın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: ACL user'ın yazma izni olmadığını doğrulayın.</label><pre><code>docker exec redis-lab redis-cli --user lab-reader --pass training-only-secret SET catalog:42 demo</code></pre><p>\`NOPERM\` beklenir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · Terminal</b>: key pattern'i içinde izinli GET komutunu deneyin.</label><pre><code>docker exec redis-lab redis-cli --user lab-reader --pass training-only-secret GET catalog:42</code></pre><p>Key henüz yoksa nil; komutun kendisi izinlidir.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI admin context</b>: eğitim user'ını kaldırın.</label><pre><code>ACL DELUSER lab-reader</code></pre><p>Disposable lab ACL user kaldırılır.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Redis CLI admin context</b>: yalnızca bu lab key'ini silin.</label><pre><code>DEL catalog:42</code></pre><p>Admin CLI default lab context'te çalışır. Production'da user/ACL bakımını plansız uygulamayın.</p></div>
      <div class="step"><label><input type="checkbox"> <b>Windows/macOS · VS Code</b>: final lab raporu için \`redis-egitimi/labs/final-lab.md\` oluşturun ve şu maddeleri doldurun.</label><ul><li>Cache-aside ürün kataloğu: hit/miss/invalidation ve TTL+jitter.</li><li>Session veya rate limiter için uygun Redis data type ve TTL.</li><li>En az bir Python test: source miss → cache hit; Redis timeout davranışı.</li><li>HA planı: primary failure, client discovery, acceptable RPO/RTO.</li><li>Security: private network, ACL user/key scope, secret/TLS, backup/restore.</li><li>Observability: p95/p99, hit/miss, DB load, memory/eviction, replication lag.</li></ul><p>Her takım mimari kararını ve trade-off'unu 5 dakikada sunar; gerçek kişisel/kurumsal veri kullanmayın.</p></div>
      <div class="info"><b>Komut kopya kâğıdı:</b> \`PING\`, \`SET key value EX 60\`, \`GET\`, \`TTL\`, \`DEL\`, \`INCRBY\`, \`HSET/HGETALL\`, \`LPUSH/RPOP\`, \`SADD/SISMEMBER\`, \`ZADD/ZRANGE\`, \`XADD/XREADGROUP/XACK\`, \`SCAN cursor MATCH pattern COUNT n\`, \`INFO\`, \`SLOWLOG GET n\`, \`MEMORY USAGE key\`. Production access ACL least privilege/context-specific.</div>
      <div class="info"><b>Hardening kontrolü:</b> Public port publish yok; private network ve firewall allowlist var; her uygulama için ayrı ACL user/key scope; TLS ve sertifika rotasyonu planlı; secret manager kullanılıyor; tehlikeli komutlar deny; image pin/scanning, non-root, resource limit, volume backup/restore ve erişim denetimi doğrulanmış.</div>
      <div class="info"><b>Cleanup:</b> Compose lab instance'i durdurun. \`docker compose down\` container/network'i kaldırır, named volume'u tutar. Disposable eğitim volume'unu yalnızca adını doğrulayıp Docker Desktop/Compose üzerinden kaldırın. Shared/production server'da \`FLUSHALL\` kullanmayın.</div>
      <h3>Kaynaklar (isteğe bağlı çevrimiçi başvuru)</h3>
      <ul>
        <li><a href="https://redis.io/docs/latest/" target="_blank" rel="noopener noreferrer">Redis resmi dokümantasyonu</a></li>
        <li><a href="https://redis.io/docs/latest/commands/" target="_blank" rel="noopener noreferrer">Redis komut referansı</a></li>
        <li><a href="https://redis.io/docs/latest/operate/oss_and_stack/management/security/" target="_blank" rel="noopener noreferrer">Redis güvenlik rehberi</a></li>
        <li><a href="https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/" target="_blank" rel="noopener noreferrer">Redis Sentinel</a> · <a href="https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/" target="_blank" rel="noopener noreferrer">Redis Cluster spec</a></li>
        <li><a href="https://redis.readthedocs.io/en/stable/" target="_blank" rel="noopener noreferrer">redis-py dokümantasyonu</a></li>
        <li><a href="https://docs.docker.com/desktop/" target="_blank" rel="noopener noreferrer">Docker Desktop</a> · <a href="https://docs.docker.com/compose/" target="_blank" rel="noopener noreferrer">Docker Compose</a></li>
        <li><a href="https://docs.python.org/3/" target="_blank" rel="noopener noreferrer">Python 3 dokümantasyonu</a> · <a href="https://flask.palletsprojects.com/" target="_blank" rel="noopener noreferrer">Flask</a></li>
        <li><a href="https://learn.microsoft.com/windows/wsl/install" target="_blank" rel="noopener noreferrer">WSL install</a> · <a href="https://code.visualstudio.com/docs/languages/python" target="_blank" rel="noopener noreferrer">VS Code Python</a></li>
      </ul>
      <p>Bu linkler yalnızca kaynak listesidir; HTML sayfalarını okumak/lab yönergelerini takip etmek için internet bağlantısı gerekmez.</p>`,
    expected: "ACL user creation OK; permitted PING PONG; SET denied NOPERM; GET permitted; lab ACL account removed. Final project includes cache, Python, HA, security and observability decisions.",
    errors: [["NOAUTH Authentication required", "Instance requires auth and admin context unavailable.", "Use authorized admin credential from approved secure channel; never bypass production ACL."], ["NOPERM this user has no permissions to run the ... command", "ACL intentionally/accidentally denies command.", "Grant only required command to correct user/key scope with administrator approval."], ["WRONGPASS invalid username-password pair or user is disabled", "Credential incorrect or ACL user disabled.", "Verify exact user and managed secret reference; avoid placing credential in shell history."], ["TLS handshake error", "CA/cert/SNI/protocol mismatch.", "Check certificate chain, hostname, client TLS settings, rotation, and server TLS listener."], ["Redis reachable from an unexpected network", "Host binding/firewall/security group/network policy too broad.", "Restrict publish to loopback/private subnet, remove public route, rotate exposed credentials, investigate access logs."]],
    easy: "`requirepass` tek başına hangi güvenlik kontrollerinin yerine geçmez?", ea: "Ağ izolasyonu, TLS, ACL least privilege, secret management, patching ve backup/monitoring'in yerine geçmez.",
    medium: "ACL `~catalog:*` neyi sınırlar?", ma: "Kullanıcının key erişimini catalog: namespace pattern'ine sınırlar; komut izinlerinden ayrı bir kapsamdır.",
    hard: "Bir Redis password public internet'e açılmış instance'ta yeterli mi?", ha: "Hayır. Network exposure kaldırılmalı, secret rotate edilmeli, erişim/etki incelenmeli ve TLS/ACL/firewall/monitoring uygulanmalı.",
    checklist: ["13 sayfa ve lab öğrenme çıktıları gözden geçirildi", "ACL user ve deny testleri anlaşıldı", "Port yalnızca gereken private interface'e bağlı", "TLS/secrets/backup/restore sorumluları belirlendi", "Final lab ve production hardening actions atanmış"],
  },
];

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const nav = pages.map((p) => `<a href="${p.file}" ${p.n === 1 ? 'aria-label="Sayfa 1"' : ""}>${String(p.n).padStart(2, "0")} · ${esc(p.short)}</a>`).join("\n");

function render(p) {
  const prev = p.n === 1 ? null : pages[p.n - 2];
  const next = p.n === pages.length ? null : pages[p.n];
  const objectives = p.goals.map((x) => `<li>${x}</li>`).join("");
  const errors = p.errors.map(([msg, cause, fix]) => `<tr><td><code>${esc(msg)}</code></td><td>${esc(cause)}</td><td>${esc(fix)}</td></tr>`).join("");
  const checks = p.checklist.map((x) => `<li><label><input type="checkbox"> ${esc(x)}</label></li>`).join("");
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(p.title)} · Redis Eğitimi</title>
<style>
:root{color-scheme:light;--ink:#172b4d;--muted:#526579;--blue:#1264a3;--teal:#087e8b;--line:#d7e0e8;--bg:#f4f7fa;--white:#fff;--soft:#eaf3fb;--amber:#a45b00;--red:#a52a2a}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.62 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:var(--blue)}a:focus,button:focus,input:focus{outline:3px solid #f2b84b;outline-offset:2px}
.top{position:sticky;top:0;z-index:4;background:#fff;border-bottom:1px solid var(--line);padding:.7rem 1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem}.brand{font-weight:800}.topnav{display:flex;gap:.8rem;align-items:center}.topnav a{font-size:.9rem;font-weight:700}
.layout{max-width:1440px;margin:auto;display:grid;grid-template-columns:255px minmax(0,1fr);gap:1.4rem;padding:1.2rem}.side{position:sticky;top:68px;align-self:start;max-height:calc(100vh - 84px);overflow:auto;background:#fff;border:1px solid var(--line);border-radius:12px;padding:1rem}.side h2{font-size:1rem;margin:.1rem 0 .6rem}.side a{display:block;padding:.28rem .4rem;text-decoration:none;font-size:.88rem;border-radius:5px}.side a:hover{background:var(--soft)}
main{min-width:0}.hero,.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:clamp(1rem,3vw,2rem);margin-bottom:1rem}.hero h1{line-height:1.2;margin:.2rem 0 .7rem;font-size:clamp(1.8rem,4vw,2.7rem)}.meta{display:flex;flex-wrap:wrap;gap:.55rem}.badge{border:1px solid #bad5e7;background:var(--soft);border-radius:99px;padding:.15rem .7rem;font-size:.88rem;font-weight:700}.card h2{margin:0 0 .75rem;font-size:1.45rem}.card h3{margin:1.3rem 0 .4rem}.card h4{margin:.8rem 0 .25rem}.card p:first-child{margin-top:0}.card ul,.card ol{padding-left:1.4rem}.note,.warn,.expert,.trainer,.info{border-left:5px solid var(--blue);border-radius:7px;padding:.85rem 1rem;margin:.8rem 0;background:#edf5fc}.trainer{border-color:var(--teal);background:#eaf7f6}.expert{border-color:#7046a1;background:#f4effa}.warn{border-color:var(--amber);background:#fff5e4}.errorbox{border-color:var(--red);background:#fff0ef}.speaker{font-style:italic;background:#fff;border:1px solid #c9dce6;padding:.7rem;border-radius:6px}.step{border:1px solid var(--line);border-radius:8px;padding:.8rem;margin:.7rem 0;background:#fbfdff}.step label{display:block}.step input,.checklist input{margin-right:.35rem;accent-color:var(--teal)}pre{position:relative;overflow:auto;background:#10243a;color:#f1f6fb;padding:2.5rem 1rem 1rem;border-radius:8px;tab-size:2;white-space:pre;max-width:100%}pre code{font: .9rem/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.copy{position:absolute;right:.45rem;top:.4rem;border:1px solid #adc5d8;border-radius:5px;background:#fff;color:#172b4d;padding:.2rem .55rem;cursor:pointer}.lang{position:absolute;top:.53rem;left:.75rem;color:#b6d8f1;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}code:not(pre code){background:#edf1f5;border-radius:4px;padding:.08rem .28rem;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;display:block;overflow:auto}th,td{border:1px solid var(--line);padding:.6rem;text-align:left;vertical-align:top;min-width:130px}th{background:#eaf3fb}.tabs{border:1px solid var(--line);padding:.7rem;border-radius:8px;background:#fff}.tab{border:1px solid #b8cbd8;background:#f2f6f9;padding:.45rem .8rem;border-radius:6px 6px 0 0;cursor:pointer;font:inherit;font-weight:700;color:var(--ink)}.tab.active{background:#1264a3;color:white}.tab-panel{display:none;padding:.6rem}.tab-panel.active{display:block}.diagram{margin:1rem 0;padding:.8rem;background:#fbfdff;border:1px solid var(--line);border-radius:8px}.diagram figcaption{font-weight:700;margin-bottom:.6rem}.diagram svg{display:block;width:100%;height:auto;max-height:260px}.diagram text{font:14px system-ui,-apple-system,"Segoe UI",sans-serif;fill:#172b4d}.checklist{list-style:none;padding:0!important}.checklist li{padding:.35rem;border-bottom:1px solid #edf1f4}.pager{display:flex;justify-content:space-between;gap:1rem}.pager a{background:#fff;border:1px solid var(--line);border-radius:8px;padding:.7rem 1rem;text-decoration:none;font-weight:700}.footer{color:var(--muted);font-size:.88rem;text-align:center;padding:1rem}
@media(max-width:900px){.layout{grid-template-columns:1fr}.side{position:relative;top:auto;max-height:240px}.top{position:relative}.topnav{flex-wrap:wrap;justify-content:flex-end}}
@media(max-width:560px){body{font-size:15px}.layout{padding:.6rem}.top{align-items:flex-start;flex-direction:column}.topnav{justify-content:flex-start}.pager{flex-direction:column}.hero,.card{padding:1rem}}
@media print{body{background:#fff;font-size:10pt}.top,.side,.copy,.tabs button,.pager,.footer{display:none!important}.layout{display:block;padding:0;max-width:none}.hero,.card{border:0;break-inside:avoid;padding:.4rem;margin:.3rem 0}.tab-panel{display:block!important}pre{white-space:pre-wrap;overflow:visible;background:#f1f3f5;color:#111}.step{break-inside:avoid}a{color:#111;text-decoration:none}}
</style>
</head>
<body>
<header class="top"><div class="brand">Redis · Kurumsal Geliştirici Eğitimi</div><nav class="topnav" aria-label="Sayfa navigasyonu"><a href="01-yol-haritasi.html">Ana menü</a>${prev ? `<a href="${prev.file}">← Önceki</a>` : ""}${next ? `<a href="${next.file}">Sonraki →</a>` : ""}</nav></header>
<div class="layout">
<aside class="side" aria-label="İçindekiler ve sayfa navigasyonu"><h2>Bu sayfa</h2><a href="#hedefler">Öğrenme hedefleri</a><a href="#egitmen">Eğitmen notu</a><a href="#kavram">Kavramsal anlatım</a><a href="#lab">Adım adım lab</a><a href="#beklenen">Beklenen çıktılar</a><a href="#hatalar">Hatalar ve çözümleri</a><a href="#alistirma">Mini alıştırmalar</a><a href="#ozet">Özet / kontrol listesi</a><hr><h2>13 sayfa</h2>${nav}</aside>
<main>
<header class="hero"><p><b>[ŞİRKET ADI / GENEL] · Redis Eğitimi</b></p><h1>${esc(p.title)}</h1><div class="meta"><span class="badge">Sayfa ${String(p.n).padStart(2, "0")} / 13</span><span class="badge">Tahmini süre: ${esc(p.duration)}</span><span class="badge">Seviye: ${esc(p.level)}</span><span class="badge">Eğitim süresi: [X gün / Y saat]</span></div><p>Bu sayfa bağımsız HTML'dir; internet bağlantısı gerektirmez. Eğitim lab dosyaları <code>redis-egitimi/docker/</code>, <code>redis-egitimi/python/</code> ve <code>redis-egitimi/labs/</code> altında tutulur.</p></header>
<section class="card" id="hedefler"><h2>1. Öğrenme hedefleri</h2><ul>${objectives}</ul><h3>Bu sayfaya başlamadan önce hazır olması gerekenler</h3><p>${esc(p.prereq)}</p></section>
<section class="card" id="egitmen"><h2>2. Eğitmen notu</h2><div class="trainer"><b>Sınıfa açılış ve aktarım dili</b><p class="speaker">${esc(p.opening)}</p><b>Sorulabilecek sorular</b><ul>${p.questions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><b>Sınıf içi tuzaklar</b><p>${esc(p.traps)}</p></div></section>
<section class="card" id="kavram"><h2>3. Kavramsal anlatım: neden → nedir → nasıl</h2><h3>Neden?</h3><p>${esc(p.why)}</p><h3>Nedir?</h3><p>${esc(p.what)}</p><h3>Nasıl?</h3><p>${esc(p.how)}</p>${p.diagram ?? ""}<div class="expert"><b>UZMAN NOTU · Üretim, performans ve güvenlik</b><p>${esc(p.expert)}</p></div></section>
<section class="card" id="lab"><h2>4. Adım adım uygulama (Lab)</h2><p>Her checkbox sayfa içi ilerleme içindir; durum kaydedilmez. Komutları verilen sırayla uygulayın. Kod bloklarının sağ üstündeki <b>Kopyala</b> düğmesi içeriği panoya alır.</p>${p.lab}</section>
<section class="card" id="beklenen"><h2>5. Beklenen çıktılar</h2><p>${esc(p.expected)}</p></section>
<section class="card errorbox" id="hatalar"><h2>6. Sık karşılaşılan hatalar ve çözümleri</h2><table><thead><tr><th>Hata mesajı (örnek)</th><th>Neden</th><th>Çözüm</th></tr></thead><tbody>${errors}</tbody></table></section>
<section class="card" id="alistirma"><h2>7. Mini alıştırmalar</h2><h3>Kolay</h3><p>${esc(p.easy)}</p><h3>Orta</h3><p>${esc(p.medium)}</p><h3>Zor</h3><p>${esc(p.hard)}</p><details><summary><b>Cevap anahtarını aç/kapat</b></summary><ol><li>${esc(p.ea)}</li><li>${esc(p.ma)}</li><li>${esc(p.ha)}</li></ol></details></section>
<section class="card" id="ozet"><h2>8. Özet ve kontrol listesi</h2><ul class="checklist">${checks}</ul><p><b>Bir sonraki sayfa:</b> ${next ? `<a href="${next.file}">${String(next.n).padStart(2, "0")}. ${esc(next.title)}</a>` : "Eğitim kapanışı tamamlandı."}</p></section>
<nav class="pager" aria-label="Önceki ve sonraki sayfa">${prev ? `<a href="${prev.file}">← ${String(prev.n).padStart(2, "0")}. ${esc(prev.short)}</a>` : "<span></span>"}${next ? `<a href="${next.file}">${String(next.n).padStart(2, "0")}. ${esc(next.short)} →</a>` : "<a href=\"01-yol-haritasi.html\">Ana menüye dön</a>"}</nav>
<p class="footer">Redis eğitimi · Kurum içi kullanım için · Komut ve arayüz adları kurulu sürümde doğrulanmalıdır.</p>
</main></div>
<script>
document.querySelectorAll("pre").forEach((pre) => {
  const code = pre.querySelector("code");
  const sample = (code?.innerText ?? "").trim();
  const label = document.createElement("span"); label.className = "lang";
  label.textContent = /^(from |import )/.test(sample) ? "PYTHON"
    : /^(services:|x-redis-node:)/.test(sample) ? "YAML"
    : /^redis==/.test(sample) ? "REQUIREMENTS"
    : /^(port \d+|appendonly |dir )/.test(sample) ? "REDIS CONF"
    : /^(docker |docker$|wsl |brew |python |python3 |py |cd |uname |Set-ExecutionPolicy)/.test(sample) ? "SHELL"
    : "REDIS CLI";
  label.setAttribute("aria-hidden", "true");
  const button = document.createElement("button"); button.className = "copy"; button.type = "button"; button.textContent = "Kopyala";
  button.setAttribute("aria-label", "Kod bloğunu kopyala");
  button.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(code?.innerText ?? ""); button.textContent = "Kopyalandı"; setTimeout(() => button.textContent = "Kopyala", 1400); }
    catch { button.textContent = "Kopyalama başarısız"; setTimeout(() => button.textContent = "Kopyala", 1800); }
  });
  pre.append(label, button);
});
document.querySelectorAll(".tabs").forEach((tabs) => {
  const buttons = [...tabs.querySelectorAll(".tab")], panels = [...tabs.querySelectorAll(".tab-panel")];
  buttons.forEach((button, index) => {
    const selected = button.classList.contains("active");
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(selected));
    button.setAttribute("aria-controls", "tab-panel-" + index);
    button.tabIndex = selected ? 0 : -1;
    panels[index]?.setAttribute("id", "tab-panel-" + index);
    panels[index]?.setAttribute("role", "tabpanel");
    if (panels[index]) panels[index].hidden = !selected;
  });
  buttons.forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.tab;
    buttons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const selected = panel.dataset.panel === name;
      panel.classList.toggle("active", selected);
      panel.hidden = !selected;
    });
  }));
});
</script>
</body></html>`;
}

for (const page of pages) {
  fs.writeFileSync(path.join(outDir, page.file), render(page), "utf8");
}
console.log(`Generated ${pages.length} standalone HTML pages in ${outDir}`);

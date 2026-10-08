# Redis Eğitimi — HTML doküman seti

Başlangıç sayfası: [01-yol-haritasi.html](./01-yol-haritasi.html). Her sayfa bağımsızdır; stil ve etkileşim kodu dosyanın içindedir. Sayfalar arası gezinme üst menü ve yan menüden yapılır.

## Sayfalar

1. [Eğitim Yol Haritası + Ön Gereksinimler](./01-yol-haritasi.html)
2. [Redis Basics](./02-redis-temelleri.html)
3. [Redis Installation and Fundamental Concepts](./03-kurulum-temel-kavramlar.html)
4. [Data Structures I](./04-veri-yapilari-1.html)
5. [Data Structures II](./05-veri-yapilari-2.html)
6. [Advanced Redis Operations](./06-ileri-islemler.html)
7. [Integration of Redis with Python](./07-python-entegrasyonu.html)
8. [High Availability and Replication](./08-yuksek-erisebilirlik.html)
9. [Redis and Cache Usage](./09-cache-kullanimi.html)
10. [Redis and the Pub/Sub Model](./10-pubsub-streams.html)
11. [Redis and Lua Scripting](./11-lua-scripting.html)
12. [Database Optimization with Redis](./12-veritabani-optimizasyonu.html)
13. [Security Principles in Redis + Kapanış](./13-guvenlik-kapanis.html)

Docker imajı, Python ve redis-py/Flask sürümleri eğitim öncesinde resmi kaynaklardan doğrulanıp sabitlenmelidir. HTML sayfalarında bu değerler bilerek placeholder olarak bırakılmıştır; `latest` etiketi kullanılmamalıdır. İlk lab ortamı `redis-egitimi/docker/compose.yaml` ile başlatılır.

İçeriği yeniden üretmek için Node.js ile `node tools/generate_redis_training.js` çalıştırın.

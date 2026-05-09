# iNet (Eksperimen)

**Goal-Oriented Communication Runtime untuk TypeScript & JavaScript**

iNet ini sebenarnya hanya sebuah **percobaan kecil yang saya buat sendiri** untuk mencoba memahami satu ide sederhana tentang bagaimana komunikasi antar sistem bisa disederhanakan.

Tidak ada niat besar di baliknya, tidak ada klaim bahwa ini lebih baik dari pendekatan lain, dan tidak juga dimaksudkan sebagai sesuatu yang “baru” atau “lebih pintar”. Ini lebih seperti **catatan eksperimen pribadi**, yang saya coba wujudkan ke dalam kode untuk melihat apakah idenya bisa hidup atau tidak.

Alih-alih terus berurusan dengan detail teknis seperti:

* WebSocket
* HTTP request
* retry logic
* fallback transport
* timeout handling

di banyak bagian aplikasi, saya mencoba membayangkan sesuatu yang lebih sederhana di permukaan:

> aplikasi cukup bilang *apa yang ingin dicapai (goal)*, dan runtime yang mencoba mencari cara untuk mencapainya.

Tapi sekali lagi, ini hanya percobaan. Tidak ada jaminan ini pendekatan yang benar, atau bahkan efisien.

> [!CAUTION]
>
> **Status Eksperimen**
> iNet masih sangat awal. Saya sering mengubah struktur, cara kerja, dan bahkan konsepnya. Bisa saja berubah total kapan saja tanpa pemberitahuan. Ini belum layak dipakai di production, kecuali benar-benar diuji dengan sangat hati-hati.

---

## Asal Usul

Kalau saya jujur, ide ini tidak muncul dari sesuatu yang besar atau “wah”. Tidak ada momen inspirasi dramatis. Justru datang dari hal-hal kecil yang sering saya temui sendiri saat mencoba membangun sistem komunikasi.

Setiap kali saya membuat aplikasi yang berhubungan dengan jaringan, selalu ada pola yang terasa berulang:

* retry logic hampir selalu ditulis lagi dari awal
* timeout handling muncul di banyak tempat
* fallback transport sering dibuat ulang dengan pola yang mirip
* dan sering kali batas antara “logika bisnis” dan “logika komunikasi” jadi agak kabur

Lama-lama saya hanya berhenti sebentar dan bertanya ke diri sendiri dengan sangat sederhana:

> *“Kalau sebenarnya aplikasi tidak perlu tahu bagaimana cara mengirim data, apakah itu mungkin?”*
>
> *“Kalau saya hanya menyebutkan tujuan akhirnya saja, apa yang akan terjadi?”*

Dari rasa penasaran kecil itu, saya mulai mencoba membuat iNet.

Bukan untuk menggantikan apa pun, bukan untuk membuktikan sesuatu, dan bukan juga karena saya merasa ini lebih baik. Saya hanya ingin melihat:

* apakah tanggung jawab transport bisa dipindahkan ke satu tempat saja (runtime)
* apakah pendekatan seperti ini masih masuk akal ketika jaringan sedang tidak stabil
* atau sebenarnya kompleksitasnya hanya pindah tempat saja tanpa benar-benar hilang

---

## Konsep Utama

iNet mencoba memperkenalkan sebuah cara berpikir yang sederhana, yang saya sebut:

> **Intent-Based Communication**

Maksudnya kurang lebih begini:
daripada fokus ke “bagaimana cara mengirimnya”, kita fokus ke “apa tujuan yang ingin dicapai”.

Jadi bukan lagi seperti ini:

```ts id="x3v0ld"
sendViaWebSocket(...)
```

atau:

```ts id="g8n2qx"
httpRequest(...)
```

---

Tapi cukup seperti ini:

```ts id="m9p3sa"
send(data, { goal: "secure-rpc" })
```

---

## Kenapa saya mencoba pendekatan ini?

Karena selama saya ngoding sistem komunikasi, saya sering merasa bahwa:

* banyak logic yang sebenarnya mirip tapi tersebar di mana-mana
* retry dan timeout tidak punya satu tempat yang jelas
* fallback sering ditulis ulang dengan gaya yang hampir sama
* dan akhirnya kode jadi penuh detail teknis yang sebenarnya tidak selalu relevan dengan tujuan utama aplikasi

Dari situ saya berpikir pelan-pelan:

> bagaimana kalau semua hal teknis itu “ditarik” ke satu tempat saja?

---

## Apa yang runtime coba lakukan

Dengan satu pemanggilan `send()`, runtime ini (secara eksperimen) mencoba menangani beberapa hal di belakang layar.

Saya tuliskan satu per satu supaya lebih jelas, tapi ini tetap hanya percobaan:

#### Pemilihan transport

Runtime mencoba memilih jalur komunikasi yang tersedia saat itu, misalnya WebSocket atau HTTP.
Keputusan ini tidak statis, tapi tergantung kondisi runtime yang sedang berjalan.

#### Retry otomatis

Kalau pengiriman gagal, runtime bisa mencoba mengirim ulang berdasarkan aturan di dalam goal.

Tapi ini pun tidak selalu sempurna, karena tergantung kondisi jaringan dan implementasi saat itu.

#### Fallback

Kalau jalur utama tidak bisa dipakai, runtime akan mencoba jalur lain yang sudah disediakan.

Ini juga masih sederhana dan belum tentu selalu optimal.

#### Menjaga urutan (jika diaktifkan)

Untuk beberapa kasus, saya mencoba menjaga agar pesan tetap dalam urutan yang benar.

Tapi ini juga bukan hal yang mudah, dan masih sangat eksperimental.

#### Deduplication

Karena ada kemungkinan pesan terkirim lebih dari sekali (misalnya karena retry), runtime mencoba mencegah data diproses dua kali.

Namun ini juga masih sangat bergantung pada kondisi implementasi.

#### Enkripsi (opsional)

Kalau diaktifkan, payload bisa dienkripsi sebelum dikirim.

Tapi ini juga masih tahap percobaan sederhana, bukan sistem keamanan yang matang.

---

## Hal penting yang ingin saya tekankan

Saya benar-benar ingin menekankan ini:

* semua ini masih percobaan
* tidak ada jaminan stabil
* tidak ada klaim ini lebih baik
* bahkan bisa saja nanti saya ubah total atau saya sederhanakan lagi

Saya hanya mencoba melihat apakah ide ini bisa “bertahan” dalam bentuk nyata, bukan untuk membuktikan sesuatu.

---

## Hal yang Saya Coba Amati

#### 1. Ketergantungan pada transport

Saya sering melihat aplikasi terlalu terikat pada satu cara komunikasi saja, dan itu membuat fleksibilitasnya terbatas.

#### 2. Pengulangan logic reliability

Retry, timeout, dan error handling sering muncul di banyak tempat, padahal secara konsep itu mirip-mirip saja.

#### 3. Trade-off antara cepat dan aman

Sering kali keputusan ini tidak punya tempat yang jelas di arsitektur, sehingga tersebar di banyak bagian kode.

---

## Hipotesis kecil yang saya uji

Dengan eksperimen ini, saya mencoba melihat beberapa kemungkinan:

* apakah komunikasi bisa cukup hanya dengan “menyebut tujuan”
* apakah runtime bisa lebih pintar dalam memilih cara pengiriman
* apakah reliability bisa dipusatkan di satu layer saja
* atau justru semua ini hanya memindahkan kompleksitas ke tempat lain

Saya sendiri juga belum punya jawaban yang pasti.

---

## API Reference

#### IntentEngine

| API          | Signature                                                 | Penjelasan                                                                                        |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `defineGoal` | `(goal: string, strategy: GoalStrategy) => void`          | Saya gunakan untuk mendefinisikan bagaimana sebuah goal seharusnya diperlakukan oleh runtime.     |
| `send`       | `(payload: any, options: IntentOptions) => Promise<void>` | Mengirim data berdasarkan goal. Semua keputusan transport, retry, dan fallback ditangani runtime. |
| `joinRoom`   | `(roomName: string) => void`                              | Untuk masuk ke konteks room sederhana.                                                            |
| `leaveRoom`  | `() => void`                                              | Untuk keluar dari room dan kembali ke mode normal.                                                |

#### IntentOptions

| Option          | Type      | Penjelasan                           |
| --------------- | --------- | ------------------------------------ |
| `goal`          | `string`  | Wajib. Menentukan tujuan komunikasi. |
| `room`          | `string`  | Override room jika diperlukan.       |
| `ttl`           | `number`  | Batas waktu hidup pesan.             |
| `race`          | `boolean` | Mengaktifkan pengiriman paralel.     |
| `encrypted`     | `boolean` | Mengaktifkan enkripsi payload.       |
| `correlationId` | `string`  | Untuk tracking dan deduplication.    |

#### GoalStrategy

| Field           | Type                    | Penjelasan                                 |
| --------------- | ----------------------- | ------------------------------------------ |
| `transport`     | `"websocket" \| "http"` | Transport utama yang dipakai runtime.      |
| `fallback`      | `string[]`              | Jalur cadangan jika transport utama gagal. |
| `retry`         | `boolean`               | Mengaktifkan retry otomatis.               |
| `priority`      | `Priority`              | Prioritas eksekusi pesan.                  |
| `ordered`       | `boolean`               | Menjaga urutan pesan tetap konsisten.      |
| `delivery`      | `DeliveryMode`          | Cara pengiriman pesan.                     |
| `encryptionKey` | `string`                | Kunci enkripsi jika diperlukan.            |

---

## Contoh Penggunaan (Sesuai Test Server)

Server ini saya buat hanya untuk simulasi kondisi yang tidak ideal, supaya saya bisa lihat bagaimana sistem bereaksi:

* packet loss
* pesan expired (TTL)
* duplikasi pesan
* room broadcast
* ordering test
* RPC sederhana

#### 1. Inisialisasi

```ts id="j9v7bx"
import { IntentEngine } from "../src/core/IntentEngine";

const inet = new IntentEngine("ws://localhost:3000");
```

#### 2. Definisi Goal

```ts id="n2p0qz"
inet.defineGoal("secure-rpc", {
  transport: "websocket",
  encryptionKey: "K0D3_R4H4514",
  retry: true,
  priority: "CRITICAL"
});

inet.defineGoal("fast-data", {
  transport: "websocket",
  fallback: ["http"],
  retry: false,
  priority: "LOW"
});
```

#### 3. Contoh Skenario

Secure RPC

```ts id="c8m2la"
await inet.send({ secret: "Data" }, {
  goal: "secure-rpc",
  encrypted: true
});
```

Fast Mode

```ts id="q1x9zp"
inet.send({ info: "Race" }, {
  goal: "fast-data",
  race: true
});
```

Room

```ts id="v0k3sd"
inet.joinRoom("lobby");

inet.send({ msg: "Hello" }, {
  goal: "fast-data"
});

inet.leaveRoom();
```

TTL

```ts id="t7w1cm"
inet.send({ pos: 1 }, {
  goal: "fast-data",
  ttl: 100
});
```

Ordering

```ts id="p5n8zr"
inet.send({ part: "1" }, { goal: "ordered-stream" });
inet.send({ part: "2" }, { goal: "ordered-stream" });
inet.send({ part: "3" }, { goal: "ordered-stream" });
```

Retry Test

```ts id="l3q8vn"
await inet.send({ attempt: "must arrive" }, {
  goal: "test-retry"
});
```

---

## Penutup

Kalau saya boleh jujur, iNet ini sebenarnya bukan sesuatu yang saya anggap besar atau penting.

Lebih tepatnya, ini cuma sebuah **cara kecil untuk menuangkan sebuah ide ke dalam bentuk yang bisa dijalankan**, supaya tidak berhenti hanya di pikiran saja.

Saya kadang merasa, ada ide-ide sederhana yang kalau tidak dicoba diwujudkan, lama-lama hanya jadi asumsi di kepala. Jadi iNet ini bisa dibilang semacam **usaha kecil untuk “menghidupkan” sebuah gagasan**, walaupun bentuknya masih jauh dari sempurna.

Saya juga tidak melihat ini sebagai sesuatu yang final atau “produk jadi”. Sama sekali tidak.

Ini lebih seperti:

* catatan yang kebetulan berbentuk kode
* percobaan yang belum tentu benar arahnya
* atau mungkin hanya cara saya memahami sesuatu dengan lebih konkret

Kadang saya cuma ingin tahu, kalau sebuah ide itu benar-benar ditulis dan dijalankan, apakah dia masih masuk akal atau justru runtuh ketika ketemu realita.

Kalau nanti ternyata ide ini tidak cocok, atau tidak terlalu berguna, atau bahkan akhirnya tidak saya lanjutkan sama sekali, saya rasa itu bukan masalah.

Justru di situ menurut saya nilai dari proses ini.

Karena dari awal memang bukan tentang “harus berhasil”, tapi lebih ke:

> mencoba membawa sebuah ide yang masih abstrak di kepala, lalu melihat bagaimana rasanya ketika dia dipaksa hidup di dunia nyata, meskipun hanya sebagai percobaan kecil.

Saya juga tidak berharap iNet ini menjadi sesuatu yang besar atau dipakai banyak orang.

Kalau pun ada sesuatu yang bisa diambil, mungkin hanya sedikit saja:
cara berpikirnya, atau sekadar catatan kecil bahwa ide sederhana pun boleh dicoba diwujudkan tanpa harus menunggu sempurna dulu.

Dan selebihnya, saya hanya ingin terus belajar dari proses ini pelan-pelan, tanpa terburu-buru dan tanpa ekspektasi berlebihan.

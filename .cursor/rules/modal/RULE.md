---

🔒 Global Modal Architecture Rule

Rule Name: Global Modal System (Mandatory)

🎯 Core Principle

Bu projede tek bir modal sistemi vardır.
Hiçbir koşulda ikinci bir modal mimarisi oluşturulamaz.

✅ ZORUNLU KURALLAR
1. Tek Modal Altyapısı

Modal altyapısı yalnızca aşağıdaki dizinde bulunur:

src/ui/shared/modal/


Bu dizin dışında:

modal state

modal UI

modal portal

modal backdrop

❌ OLAMAZ

2. UI Bileşenleri Modal Yönetemez

❌ Yasak:

const [open, setOpen] = useState(false);


❌ Yasak:

{show && <Modal />}


✅ Doğru:

openModal({ type: 'CONFIRM_DELETE', payload })


Modal state sadece ModalProvider içindedir.

3. Modal = Infrastructure

Modal sistemi feature değildir

Preset, import, export, i18n gibi logic modal içinde yazılmaz

Modal sadece:

layout

backdrop

keyboard (ESC)

lifecycle

yönetir.

4. Modal Türleri Merkezîdir

Modal tipleri tek bir enum/union üzerinden tanımlanır

Her modal tipi:

tek entry point

tek render yolu

sahip olmalıdır.

5. Modal’lar Asla Duplicate Edilmez

❌ Her feature kendi modalını yazamaz
❌ PresetDeleteModal.tsx gibi dağınık yapılar yasak

✅ Tek sistem → çok içerik

6. Prod / Dev Davranışı

Modal altyapısı her ortamda aynıdır

Sadece içerik değişir

Debug modal ayrı sistem kuramaz

7. Linter / Warning Politikası

Modal altyapısında:

unused import

unused type

TODO spam

❌ yasak
Modal altyapısı 0 warning ile çalışmalıdır.

8. Geleceğe Yönelik Genişleme

Yeni bir modal eklemek:

yeni provider

yeni portal

yeni state

❌ gerektirmemelidir.

alwaysApply: true
---

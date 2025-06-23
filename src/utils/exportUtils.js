import { utils, writeFile } from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Uygulama logosu base64 olarak (örnek bir logo, gerçek uygulamada değiştirilmeli)
const APP_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYWN0aXZpdHkiPjxwb2x5bGluZSBwb2ludHM9IjIyIDEyIDE4IDEyIDE1IDE2IDkgOCA2IDEyIDIgMTIiPjwvcG9seWxpbmU+PC9zdmc+";
const APP_NAME = "Sağlık Yolcusu";

/**
 * Sağlık verilerini Excel formatında dışa aktarır
 * @param {Array} data - Dışa aktarılacak veri dizisi
 * @param {String} fileName - Dosya adı
 * @param {String} sheetName - Excel sayfası adı
 */
export const exportToExcel = (data, fileName = 'saglik-verileri', sheetName = 'Veriler') => {
  try {
    if (!data || data.length === 0) {
      console.error("Dışa aktarılacak veri bulunamadı");
      return false;
    }
    
    // Verileri Excel formatına dönüştür
    const worksheet = utils.json_to_sheet(data);
    
    // Sütun genişliklerini ayarla
    const colWidths = [];
    const headers = Object.keys(data[0] || {});
    
    headers.forEach(header => {
      // Başlık uzunluğuna göre minimum genişlik belirle
      let maxWidth = header.length;
      
      // Veri uzunluklarını kontrol et
      data.forEach(row => {
        const cellValue = String(row[header] || '');
        if (cellValue.length > maxWidth) {
          maxWidth = Math.min(cellValue.length, 50); // Maximum 50 karakter genişlik
        }
      });
      
      colWidths.push({ wch: maxWidth + 2 }); // Biraz extra boşluk ekle
    });
    
    // Sütun genişliklerini ayarla
    worksheet['!cols'] = colWidths;
    
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Dosyayı indir
    writeFile(workbook, `${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error("Excel dışa aktarma hatası:", error);
    alert("Excel dosyası oluşturulurken bir hata oluştu.");
    return false;
  }
};

/**
 * Sağlık verilerini PDF formatında dışa aktarır
 * @param {Array} data - Dışa aktarılacak veri dizisi
 * @param {String} fileName - Dosya adı
 * @param {String} title - PDF başlığı
 * @param {Array} columns - Tablo sütunları [{ header: 'Başlık', dataKey: 'veriAnahtarı' }]
 */
export const exportToPDF = (data, fileName = 'saglik-verileri', title = 'Sağlık Verileri', columns = []) => {
  try {
    if (!data || data.length === 0) {
      console.error("PDF dışa aktarma hatası: Veri bulunamadı");
      return false;
    }
    
    // PDF oluştur - A4 boyutu ve portrait oryantasyonu
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // PDF üst bilgisi
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo ekle
    const logoWidth = 20;
    const logoHeight = 10;
    const logoX = 10;
    const logoY = 10;
    doc.addImage(APP_LOGO, 'PNG', logoX, logoY, logoWidth, logoHeight);
    
    // Başlık
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(APP_NAME, pageWidth / 2, logoY + 8, { align: 'center' });
    
    // Alt başlık
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(title, pageWidth / 2, logoY + 20, { align: 'center' });
    
    // Tarih
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Oluşturma Tarihi: ${date}`, pageWidth - 15, logoY + 10, { align: 'right' });
    
    // Tablo için sütun başlıkları ve veri anahtarlarını ayarla
    let tableColumns = columns;
    if (columns.length === 0 && data.length > 0) {
      // Eğer sütunlar belirtilmemişse, veri anahtarlarından otomatik oluştur
      tableColumns = Object.keys(data[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1),
        dataKey: key
      }));
    }
    
    // Tabloyu oluşturmak için başlık ve gövde verilerini hazırla
    const headers = tableColumns.map(col => col.header);
    const tableBody = data.map(item => tableColumns.map(col => item[col.dataKey] || ''));
    
    // Tablo oluştur
    doc.autoTable({
      startY: logoY + 30, // Başlıktan sonra başla
      head: [headers],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246], // Primary mavi renk
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { // İlk sütun (tarih) için özel stil
          fontStyle: 'bold',
        }
      },
      margin: { top: 30, right: 10, bottom: 10, left: 10 },
      didDrawPage: (data) => {
        // Her sayfanın alt bilgisi
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `${APP_NAME} - Sayfa ${doc.internal.getCurrentPageInfo().pageNumber}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });
    
    // Dosyayı indir
    doc.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error("PDF dışa aktarma hatası:", error);
    alert("PDF dosyası oluşturulurken bir hata oluştu.");
    return false;
  }
};

/**
 * Sağlık verilerini Word benzeri DOC formatında dışa aktarır
 * Not: Tam bir Word dokümanı değil, HTML tabanlı bir yaklaşımdır
 * @param {Array} data - Dışa aktarılacak veri dizisi
 * @param {String} fileName - Dosya adı
 * @param {String} title - Doküman başlığı
 * @param {Array} columns - Tablo sütunları [{ header: 'Başlık', dataKey: 'veriAnahtarı' }]
 */
export const exportToWord = (data, fileName = 'saglik-verileri', title = 'Sağlık Verileri', columns = []) => {
  try {
    // Analiz metni oluştur 
    let analysisHtml = "<p style='margin-bottom: 20px;'>Bu rapor, sağlık verilerinizin son durumunu göstermektedir.</p>";
    
    // Basit bir analiz ekle
    if (data.length > 0) {
      // Ortalama adım sayısı analizi
      let totalSteps = 0;
      let stepsCount = 0;
      data.forEach(item => {
        if (item.AdımSayısı && !isNaN(item.AdımSayısı)) {
          totalSteps += Number(item.AdımSayısı);
          stepsCount++;
        }
      });
      
      if (stepsCount > 0) {
        const avgSteps = Math.round(totalSteps / stepsCount);
        analysisHtml += `<p style='margin-bottom: 10px;'><b>Adım Analizi:</b> Günlük ortalama <span style="color: #3b82f6; font-weight: bold;">${avgSteps}</span> adım atıyorsunuz. `;
        
        if (avgSteps < 5000) {
          analysisHtml += "Bu değer, önerilen günlük adım sayısının altındadır. Daha fazla yürüyüş yapmayı deneyebilirsiniz.</p>";
        } else if (avgSteps < 10000) {
          analysisHtml += "Bu iyi bir değer, ancak günlük 10.000 adım hedefine ulaşmak için biraz daha artırabilirsiniz.</p>";
        } else {
          analysisHtml += "Harika! Önerilen günlük adım sayısını aşıyorsunuz ve aktif bir yaşam sürüyorsunuz.</p>";
        }
      }
      
      // Uyku analizi
      let totalSleep = 0;
      let sleepCount = 0;
      data.forEach(item => {
        if (item.Uyku && !isNaN(item.Uyku)) {
          totalSleep += Number(item.Uyku);
          sleepCount++;
        }
      });
      
      if (sleepCount > 0) {
        const avgSleep = (totalSleep / sleepCount).toFixed(1);
        analysisHtml += `<p style='margin-bottom: 10px;'><b>Uyku Analizi:</b> Günlük ortalama <span style="color: #3b82f6; font-weight: bold;">${avgSleep}</span> saat uyuyorsunuz. `;
        
        if (avgSleep < 6) {
          analysisHtml += "Bu değer, önerilen uyku süresinin altındadır. Daha fazla uyumaya çalışın.</p>";
        } else if (avgSleep < 7) {
          analysisHtml += "Bu değer minimum önerilen uyku süresine yakın, ancak biraz daha artırabilirsiniz.</p>";
        } else if (avgSleep <= 9) {
          analysisHtml += "Harika! Önerilen uyku süresi aralığındasınız.</p>";
        } else {
          analysisHtml += "Ortalama uyku süreniz önerilen değerden biraz fazla. Uyku kalitenizi kontrol etmek isteyebilirsiniz.</p>";
        }
      }
    }
    
    // HTML dokümanı oluştur
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          h1 { color: #2563eb; text-align: center; margin-bottom: 20px; }
          h2 { color: #3b82f6; margin-top: 30px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .highlight { color: #2563eb; font-weight: bold; }
          .header { display: flex; align-items: center; margin-bottom: 30px; }
          .logo { width: 60px; height: 60px; margin-right: 20px; }
          .report-info { margin-bottom: 30px; }
          .footer { margin-top: 50px; font-size: 0.9em; color: #6b7280; border-top: 1px solid #ddd; padding-top: 20px; }
          .analysis { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="logo" src="${APP_LOGO}" alt="Logo">
          <h1>${APP_NAME} - ${title}</h1>
        </div>
        
        <div class="report-info">
          <p><strong>Rapor Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="analysis">
          ${analysisHtml}
        </div>
        
        <h2>Sağlık Verileri</h2>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;
    
    // Tablo satırlarını oluştur
    data.forEach(item => {
      html += `<tr>
        ${columns.map(col => {
          const value = item[col.dataKey];
          // AdımSayısı kolonu için özel stil
          if (col.dataKey === 'AdımSayısı' && !isNaN(value) && Number(value) >= 10000) {
            return `<td><span class="highlight">${value}</span></td>`;
          }
          return `<td>${value}</td>`;
        }).join('')}
      </tr>`;
    });
    
    // HTML'i tamamla
    html += `
        </tbody>
      </table>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${APP_NAME} - Bu rapor otomatik olarak oluşturulmuştur.</p>
        <p>Bu belgeyi sağlık uzmanınızla paylaşmadan önce, verilerinizin doğruluğunu kontrol etmeniz önerilir.</p>
      </div>
      </body>
      </html>
    `;
    
    // HTML'i Blob olarak hazırla ve indir
    const blob = new Blob([html], { type: 'application/msword' });
    saveAs(blob, `${fileName}.doc`);
    return true;
  } catch (error) {
    console.error("Word dışa aktarma hatası:", error);
    alert("Word dosyası oluşturulurken bir hata oluştu.");
    return false;
  }
};

/**
 * Egzersiz tamamlama kanıtı için dosya yükleme
 * @param {Function} onFileSelect - Dosya seçildiğinde çağrılacak fonksiyon
 * @param {Array} acceptedTypes - Kabul edilen dosya türleri
 * @param {Number} maxSizeMB - Maksimum dosya boyutu (MB)
 */
export const uploadExerciseProof = (onFileSelect, acceptedTypes = ['image/jpeg', 'image/png', 'video/mp4'], maxSizeMB = 10) => {
  try {
    // Dosya seçme input'u oluştur
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedTypes.join(',');
    
    // Dosya seçimi değiştiğinde
    input.onchange = (event) => {
      const file = event.target.files[0];
      
      // Dosya seçilmediyse
      if (!file) return;
      
      // Dosya türü kontrolü
      if (!acceptedTypes.includes(file.type)) {
        alert('Desteklenmeyen dosya türü. Lütfen bir resim veya video yükleyin.');
        return;
      }
      
      // Dosya boyutu kontrolü
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`Dosya boyutu çok büyük. Maksimum ${maxSizeMB}MB izin verilir.`);
        return;
      }
      
      // Dosya URL'si oluştur
      const fileUrl = URL.createObjectURL(file);
      
      // Geri çağırma fonksiyonunu çağır
      onFileSelect({
        file,
        fileUrl,
        type: file.type,
        name: file.name,
        size: file.size,
      });
    };
    
    // Dosya seçme penceresini aç
    input.click();
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    alert("Dosya yükleme sırasında bir hata oluştu.");
  }
};
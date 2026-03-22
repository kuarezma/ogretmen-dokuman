import React, { useState } from 'react';
import { Sparkles, FileText, Download, Copy, RefreshCw, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './AiGenerator.css';

const AiGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [grade, setGrade] = useState('Tüm Sınıflar');
  const [lesson, setLesson] = useState('Genel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const GRADES = ["İlkokul", "Ortaokul", "Lise", "Tüm Sınıflar"];
  const LESSONS = ["Matematik", "Türkçe / Edebiyat", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Genel"];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Lütfen ne istediğinizi açıklayın.");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    // AI API Eklentisi Buraya Gelecek (Gemini / OpenAI API)
    // Şu an demo/mock up işlemi yapıyoruz:
    setTimeout(() => {
      const mockResult = `
# ${grade} ${lesson} - Çalışma Kağıdı

## Konu: ${prompt}

Bu alan yapay zeka (API) entegrasyonu için tamamen hazır biçimde kodlanmıştır. 
Gerçek bir API bağlaması yapıldığında (örneğin OpenAI GPT-4 veya Google Gemini), öğretmenin verdiği komuta göre anında 10 soruluk testler, kısa konu anlatımları veya etkinlik şablonları burada otomatik olarak üretilecektir!

Örnek Çıktı İçeriği:
1. Soru: ...
2. Soru: ...
3. Soru: ...

Not: Developer olarak kodu src/pages/AiGenerator.jsx dosyasında "handleGenerate" fonksiyonuna API key'inizle birlikte ekleyebilirsiniz.
      `.trim();
      
      setResult(mockResult);
      setIsGenerating(false);
      toast.success("İçerik başarıyla oluşturuldu!");
    }, 2500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success("Metin kopyalandı!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "ai-olusturulan-belge.txt";
    document.body.appendChild(element);
    element.click();
    toast.success("Belge indiriliyor...");
  };

  return (
    <div className="ai-page container animate-fade-in">
      <div className="ai-header">
        <div className="ai-title-section">
          <h2><Bot size={32} color="var(--color-primary)" /> AI İçerik Üretici (Beta)</h2>
          <p>Sınav soruları, çalışma kağıtları veya konu özetleri oluşturmak için yapay zeka asistanınızı kullanın.</p>
        </div>
      </div>

      <div className="ai-content-grid">
        {/* Sol Panel: Form */}
        <div className="ai-form-container glass-panel">
          <form onSubmit={handleGenerate}>
            <div className="form-group row-group">
              <div className="input-half">
                <label>Sınıf Kademesi</label>
                <select className="input-field select-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="input-half">
                <label>Ders</label>
                <select className="input-field select-input" value={lesson} onChange={(e) => setLesson(e.target.value)}>
                  {LESSONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Ne Üretmek İstiyorsunuz?</label>
              <textarea 
                className="input-field" 
                placeholder="Örn: 5. sınıf kesirler konusu ile ilgili 10 soruluk, 3 tanesi zor olan, orta seviye bir test hazırla..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
            </div>

            <button type="submit" className="btn btn-primary ai-submit-btn" disabled={isGenerating}>
              {isGenerating ? (
                <><RefreshCw size={18} className="spin" /> Üretiliyor...</>
              ) : (
                <><Sparkles size={18} /> İçerik Üret</>
              )}
            </button>
          </form>
        </div>

        {/* Sağ Panel: Çıktı */}
        <div className="ai-result-container glass-panel">
          {isGenerating ? (
            <div className="ai-loading-state">
              <Sparkles size={48} className="pulse-icon" color="var(--color-primary)" />
              <h3>Yapay Zeka Çalışıyor</h3>
              <p>İsteğinize uygun içerik saniyeler içinde hazırlanıyor...</p>
            </div>
          ) : result ? (
            <div className="ai-result-content">
              <div className="result-actions">
                <h4>Üretilen İçerik</h4>
                <div className="action-btns">
                  <button className="btn btn-ghost btn-sm" onClick={copyToClipboard} title="Kopyala">
                    <Copy size={16} />
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleDownload} title="Metin Belgesi Olarak İndir">
                    <Download size={16} /> İndir
                  </button>
                </div>
              </div>
              <div className="result-text-area">
                <pre>{result}</pre>
              </div>
            </div>
          ) : (
            <div className="ai-empty-state">
              <FileText size={48} color="var(--color-text-muted)" />
              <h3>Çıktı Ekranı</h3>
              <p>Sol taraftaki formu doldurup "İçerik Üret" butonuna bastığınızda sonuçlar burada görünecektir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiGenerator;

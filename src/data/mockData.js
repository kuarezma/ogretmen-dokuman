export const initialDocuments = [
  {
    id: '1',
    title: '10. Sınıf Kimya 1. Dönem 1. Yazılı Soruları',
    description: 'Yeni müfredata uygun, açık uçlu klasik kimya yazılı soruları ve cevap anahtarı.',
    type: 'word',
    category: 'Yazılı',
    uploader: 'Ahmet Hoca',
    date: '12 Eki 2023',
    downloads: 145
  },
  {
    id: '2',
    title: '9. Sınıf Coğrafya Yıllık Plan 2023-2024',
    description: 'Tüm yıla yayılmış MEB formatında güncel coğrafya yıllık planı.',
    type: 'excel',
    category: 'Yıllık Plan',
    uploader: 'Elif Öğretmen',
    date: '05 Eyl 2023',
    downloads: 320
  },
  {
    id: '3',
    title: 'LGS Matematik Deneme Sınavı 1',
    description: 'Yeni nesil sorulardan oluşan 20 soruluk LGS matematik denemesi.',
    type: 'pdf',
    category: 'Test',
    uploader: 'Matematik Kulübü',
    date: '20 Kas 2023',
    downloads: 580
  },
  {
    id: '4',
    title: 'Tarih Dersi Performans Proje Konuları',
    description: 'Tüm lise kademeleri için detaylı araştırma ve proje ödev konuları.',
    type: 'word',
    category: 'Proje',
    uploader: 'Veli Bey',
    date: '15 Şub 2024',
    downloads: 85
  },
  {
    id: '5',
    title: 'İngilizce Irregular Verbs Liste ve Çalışma Kağıdı',
    description: 'Düzensiz fiillerin 3 hali, anlamları ve boşluk doldurma etkinlikleri.',
    type: 'pdf',
    category: 'Etkinlik',
    uploader: 'Zeynep Tr',
    date: '10 Oca 2024',
    downloads: 412
  }
];

// Initialize localStorage with mock data if empty
export const initializeMockData = () => {
  if (!localStorage.getItem('documents')) {
    localStorage.setItem('documents', JSON.stringify(initialDocuments));
  }
};

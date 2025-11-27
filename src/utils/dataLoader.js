import Papa from 'papaparse';

export const loadCSV = async (filename) => {
  try {
    const response = await fetch(`/${filename}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`✅ Loaded ${results.data.length} rows from ${filename}`);
          resolve(results.data);
        },
        error: (error) => {
          console.error(`❌ Error loading ${filename}:`, error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error fetching ${filename}:`, error);
    throw error;
  }
};

export const loadJSON = async (filename) => {
  try {
    const response = await fetch(`/${filename}`);
    const data = await response.json();
    console.log(`✅ Loaded JSON from ${filename}`);
    return data;
  } catch (error) {
    console.error(`❌ Error loading ${filename}:`, error);
    throw error;
  }
};

export const loadAllData = async (dataSource = 'ft50') => {
  try {
    console.log(`📥 Loading data files... (source: ${dataSource})`);
    
    const suffix = dataSource === 'service' ? '_service' : '_ft50';
    
    const [csvData, previousData, childRelations] = await Promise.all([
      loadCSV(`top_predicted_pairs${suffix}.csv`),
      loadCSV(`previous_concept_pairs${suffix}.csv`),
      loadJSON('child_relationship_add_subchild.json')  // 새로운 JSON 파일 사용
    ]);
    
    // previous 데이터를 top_predicted_pairs와 동일한 형식으로 정규화
    const normalizedPreviousData = previousData.map(row => ({
      concept1: row.concept1,
      concept2: row.concept2,
      pred: 1.0,
      c1_community: row.c1_community,
      c2_community: row.c2_community,
      publication_year: row.publication_year,
      // 누락된 필드들 추가
      concept1_freq: 'N/A',
      concept2_freq: 'N/A',
      concept1_top1_field: 'N/A',
      concept1_top1_ratio: 0,
      concept2_top1_field: 'N/A',
      concept2_top1_ratio: 0
    }));
    
    console.log('✅ All data loaded successfully');
    console.log(`📊 Predicted pairs: ${csvData.length}, Previous pairs: ${normalizedPreviousData.length}`);
    
    return { csvData, previousData: normalizedPreviousData, childRelations };
  } catch (error) {
    console.error('❌ Error loading data:', error);
    throw error;
  }
};
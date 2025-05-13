// 환경 변수 로드
import './load-env.mjs';

import { db } from '@/lib/firebase';
import { mockPrograms, mockUsers, initialMockVouchers, mockBanners, initialMockDiscussionsData } from '@/lib/mock-data';
import { collection, doc, writeBatch } from 'firebase/firestore';

/**
 * Firestore에 샘플 데이터를 업로드하는 함수
 */
async function uploadSampleData() {
  try {
    console.log('샘플 데이터 업로드 시작...');
    
    // 프로그램 데이터 업로드
    console.log('프로그램 데이터 업로드 중...');
    const programsRef = collection(db, 'programs');
    const programBatch = writeBatch(db);
    
    for (const program of mockPrograms) {
      const programDoc = doc(programsRef, program.id);
      programBatch.set(programDoc, {
        ...program,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    await programBatch.commit();
    console.log(`${mockPrograms.length}개의 프로그램이 업로드되었습니다.`);
    
    // 사용자 데이터 업로드
    console.log('사용자 데이터 업로드 중...');
    const usersRef = collection(db, 'users');
    const userBatch = writeBatch(db);
    
    for (const user of mockUsers) {
      const userDoc = doc(usersRef, user.id);
      userBatch.set(userDoc, {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    await userBatch.commit();
    console.log(`${mockUsers.length}개의 사용자가 업로드되었습니다.`);
    
    // 바우처 데이터 업로드
    console.log('바우처 데이터 업로드 중...');
    const vouchersRef = collection(db, 'vouchers');
    const voucherBatch = writeBatch(db);
    
    for (const voucher of initialMockVouchers) {
      const voucherDoc = doc(vouchersRef, voucher.id);
      voucherBatch.set(voucherDoc, {
        ...voucher,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    await voucherBatch.commit();
    console.log(`${initialMockVouchers.length}개의 바우처가 업로드되었습니다.`);
    
    // 배너 데이터 업로드
    console.log('배너 데이터 업로드 중...');
    const bannersRef = collection(db, 'banners');
    const bannerBatch = writeBatch(db);
    
    for (const banner of mockBanners) {
      const bannerDoc = doc(bannersRef, banner.id);
      bannerBatch.set(bannerDoc, {
        ...banner,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    await bannerBatch.commit();
    console.log(`${mockBanners.length}개의 배너가 업로드되었습니다.`);
    
    // 토론 데이터 업로드
    console.log('토론 데이터 업로드 중...');
    const discussionsRef = collection(db, 'discussions');
    const discussionBatch = writeBatch(db);
    
    for (const discussion of initialMockDiscussionsData) {
      const discussionDoc = doc(discussionsRef, discussion.id);
      discussionBatch.set(discussionDoc, {
        ...discussion,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    await discussionBatch.commit();
    console.log(`${initialMockDiscussionsData.length}개의 토론이 업로드되었습니다.`);
    
    console.log('샘플 데이터 업로드가 완료되었습니다.');
  } catch (error) {
    console.error('샘플 데이터 업로드 중 오류 발생:', error);
  }
}

// 스크립트 실행
uploadSampleData().then(() => {
  console.log('업로드 스크립트 종료');
}).catch(err => {
  console.error('스크립트 실행 중 오류 발생:', err);
}); 
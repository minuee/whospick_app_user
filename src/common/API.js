import {Api} from '@psyrenpark/api';

var projectName = 'wsp'; // 각 프로젝트 단축명
var projectEnv = 'prod'; // 각 프로젝트 환경 // dev, test, prod

var v1Api = `${projectName}-${projectEnv}-api-v1`;
var v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;

export const IMAGE_URL = 'https://file.whospick.com/public/';

export const apiObject = {
  //!------------------------------------------
  //! 인증 있는 api

  // 회원 기본 정보 입력
  applyUserInfo: ({name, mobile_no, birth_dt, referral_code}, loading) => {
    var apiName = v1Api;
    var path = '/actor/my-privacy';
    var myInit = {
      body: {
        langCode: 'ko',
        name,
        mobile_no,
        birth_dt,
        referral_code,
      },
      // queryStringParameters: {
      // },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 로그인 후 회원 기본 정보 가져오기
  getUserInfo: loading => {
    var apiName = v1Api;
    var path = '/actor/my-info';
    var myInit = {
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 내 배우 정보 가져오기
  getMyActorInfo: loading => {
    var apiName = v1Api;
    var path = '/actor/my-profile';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 배우 디테일 정보 가져오기
  getActorInfo: ({actor_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/actor/${actor_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 공지사항 가져오기
  getNoticeList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/notice-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 알림 가져오기
  getNotificationList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/notify-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 알림 읽기
  confirmNotification: ({notify_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/confirm/notify';
    var myInit = {
      body: {
        notify_no,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 이미지 업로드
  imageUpload: ({url}, loading) => {
    var apiName = v1Api;
    var path = '/actor/image';
    var myInit = {
      body: {
        url,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 회원정보 수정
  editUserInfo: ({name, mobile_no, profile_image_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/my-privacy';
    var myInit = {
      body: {
        name,
        mobile_no,
        profile_image_no,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 감독용 <==> 배우용 타입 추가
  addUserType: loading => {
    var apiName = v1Api;
    var path = '/actor/signup';
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // FAQ 목록 가져오기
  getFAQList: ({faq_category_no, search_text}, loading) => {
    var apiName = v1Api;
    var path = `/actor/faq-list/${faq_category_no}`;
    var myInit = {
      queryStringParameters: {
        search_text,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 리스트 가져오기
  getPartnerList: ({affiliate_category_no, next_token, search_text}, loading) => {
    var apiName = v1Api;
    var path = `/actor/affiliate-list/${affiliate_category_no}`;
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 상세 가져오기
  getPartnerDetail: ({affiliate_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/affiliate/${affiliate_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 댓글/대댓글 등록하기
  addPartnerComment: ({affiliate_no, affiliate_comment_no, content}, loading) => {
    var apiName = v1Api;
    var path = `/actor/affiliate/${affiliate_no}/comment`;
    var myInit = {
      body: {
        affiliate_comment_no,
        content,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 내 1:1 고객 문의 가져오기
  getMyQnAList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/my-qna-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 1:1 문의 작성하기
  addMyQnA: ({title, content}, loading) => {
    var apiName = v1Api;
    var path = '/actor/qna';
    var myInit = {
      body: {
        title,
        content,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 배우 프로필 저장
  applyActorProfile: (
    {
      actor_type_no,
      main_profile,
      introduce,
      additional_profile,
      video_url,
      facebook,
      instagram,
      twitter,
      name,
      birth_dt,
      gender,
      height,
      weight,
      top,
      bottom,
      shoes,
      education,
      major,
      specialty,
      has_agency,
      career_list,
      detail_info_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/my-profile';
    var myInit = {
      body: {
        actor_type_no,
        main_profile,
        introduce,
        additional_profile,
        video_url,
        facebook,
        instagram,
        twitter,
        name,
        birth_dt,
        gender,
        height,
        weight,
        top,
        bottom,
        shoes,
        education,
        major,
        specialty,
        has_agency,
        career_list,
        detail_info_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 배우 프로필 수정
  editActorProfile: (
    {
      actor_type_no,
      main_profile,
      introduce,
      additional_profile,
      video_url,
      facebook,
      instagram,
      twitter,
      name,
      birth_dt,
      gender,
      height,
      weight,
      top,
      bottom,
      shoes,
      education,
      major,
      specialty,
      has_agency,
      career_list,
      detail_info_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/my-profile';
    var myInit = {
      body: {
        actor_type_no,
        main_profile,
        introduce,
        additional_profile,
        video_url,
        facebook,
        instagram,
        twitter,
        name,
        birth_dt,
        gender,
        height,
        weight,
        top,
        bottom,
        shoes,
        education,
        major,
        specialty,
        has_agency,
        career_list,
        detail_info_list,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 추천 배우 가져오기
  getRecommendActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/recommend-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 인기 배우 가져오기
  getPopularActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/popular-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 실시간 배우 가져오기
  getRealTimeActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/realtime-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 급상승 배우 가져오기
  getRisingActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/rising-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 지원한 오디션 가져오기
  getApplyAuditionList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/apply-audition-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 평가 요청
  requestMyProfile: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/apply-eval-me/${audition_no}`;
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 평가 요청 가져오기
  getRequestProfileList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/apply-eval-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 평가 요청 상세 정보 가져오기
  getRequestProfileDetail: ({eval_apply_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/eval-me/${eval_apply_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 평가 요청 삭제하기
  removeRequestProfile: ({eval_apply_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/remove-apply-eval/';
    var myInit = {
      body: {
        eval_apply_no,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 나를 픽한 디렉터 가져오기
  getPickDirector: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/pick-me-director-list/';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 나를 픽한 디렉터 삭제
  removePickDirector: ({audition_ask_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/remove-pick-me-director/';
    var myInit = {
      body: {
        audition_ask_no,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 나를 픽한 디렉터의 오디션 가져오기
  getPickDirectorAudition: ({user_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/director-audition-list/${user_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 찜한 오디션 가져오기
  getJJimAuditionList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/dibs-audition-list/';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 찜한 배역 가져오기
  getJJimRolesList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/actor/dibs-audition-recruit-list/';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 찜하기
  addFavorite: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/dibs-audition/${audition_no}`;
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 찜 해제하기
  deleteFavorite: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/undibs-audition/';
    var myInit = {
      body: {
        audition_no: [audition_no],
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 배역 찜하기
  addActorFavorite: ({audition_recruit_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/dibs-audition-recruit/${audition_recruit_no}`;
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 배역 찜 해제하기
  deleteActorFavorite: ({audition_recruit_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/undibs-audition-recruit/';
    var myInit = {
      body: {
        audition_recruit_no: [audition_recruit_no],
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 조회하기
  getAuditionInfo: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/actor/audition/${audition_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 지원하기
  applyAudition: ({audition_recruit_no, pay_point, charge_point, pay_method}, loading) => {
    var apiName = v1Api;
    var path = '/actor/audition-apply';
    var myInit = {
      body: {
        audition_recruit_no: [audition_recruit_no],
        pay_point,
        charge_point,
        pay_method,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 필터 적용 배우 검색
  searchActor: (
    {
      next_token,
      search_text,
      work_type_no,
      role_weight_no,
      gender,
      age_start,
      age_end,
      height_start,
      height_end,
      detail_info_list,
      genre_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/search/actor';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
      body: {
        search_text,
        work_type_no,
        role_weight_no,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
        genre_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 파트너 검색
  searchPartner: (
    {
      next_token,
      search_text,
      work_type_no,
      role_weight_no,
      gender,
      age_start,
      age_end,
      height_start,
      height_end,
      detail_info_list,
      genre_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/search/affiliate';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
      body: {
        search_text,
        work_type_no,
        role_weight_no,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
        genre_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 검색
  searchAudition: (
    {
      next_token,
      search_text,
      work_type_no,
      role_weight_no,
      gender,
      age_start,
      age_end,
      height_start,
      height_end,
      detail_info_list,
      genre_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/search/audition';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
      body: {
        search_text,
        work_type_no,
        role_weight_no,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
        genre_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 필터 적용 통합검색
  searchAll: (
    {
      search_text,
      work_type_no,
      role_weight_no,
      gender,
      age_start,
      age_end,
      height_start,
      height_end,
      detail_info_list,
      genre_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/search/all';
    var myInit = {
      body: {
        search_text,
        work_type_no,
        role_weight_no,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
        genre_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 회원탈퇴
  deleteUser: loading => {
    var apiName = v1Api;
    var path = '/actor/me';
    var myInit = {};
    return Api.del(apiName, path, myInit, loading);
  },

  // FCM 토큰 등록
  applyPushToken: ({token_value}, loading) => {
    var apiName = v1Api;
    var path = '/actor/push_token';
    var myInit = {
      body: {
        token_value,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 포인트 내역
  getPointHistory: loading => {
    var apiName = v1Api;
    var path = '/actor/payments/main-page';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 포인트 사용 내역
  getPointUsedHistory: ({year}, loading) => {
    var apiName = v1Api;
    var path = '/actor/payments/pay-list/use';
    var myInit = {
      queryStringParameters: {
        year,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 포인트 충전 내역
  getPointBuyHistory: ({year}, loading) => {
    var apiName = v1Api;
    var path = '/actor/payments/pay-list/charge';
    var myInit = {
      queryStringParameters: {
        year,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 포인트 환불 내역
  getPointRefundHistory: ({year}, loading) => {
    var apiName = v1Api;
    var path = '/actor/payments/pay-list/refund';
    var myInit = {
      queryStringParameters: {
        year,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 포인트 적립 내역
  getPointSaveUpHistory: ({year}, loading) => {
    var apiName = v1Api;
    var path = '/actor/payments/pay-list/point';
    var myInit = {
      queryStringParameters: {
        year,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 포인트 환불
  applyPointRefund: ({pay_no, reason}, loading) => {
    var apiName = v1Api;
    var path = '/actor/payments/cancel';
    var myInit = {
      body: {
        pay_no,
        reason,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 주문번호 생성
  createOrderNo: ({pay_point, pay_method}, loading) => {
    var apiName = v1Api;
    var path = '/actor/merchant-uid';
    var myInit = {
      body: {
        pay_point,
        pay_method,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 주문 완료
  applyOrder: ({imp_uid, merchant_uid, audition_recruit_no}, loading) => {
    var apiName = v1Api;
    var path = '/actor/payments/complete';
    var myInit = {
      body: {
        imp_uid,
        merchant_uid,
        audition_recruit_no,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 홈 탭
  getTabOneList: loading => {
    var apiName = v1Api;
    var path = '/actor/main-page';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션공고 탭
  getTabTwoList: (
    {
      next_token,
      search_text,
      order,
      category_work_type_no,
      work_type_no,
      work_type_detail_no,
      role_weight_no,
      gender,
      age_start,
      age_end,
      height_start,
      height_end,
      detail_info_list,
      genre_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/actor/search/audition';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
      body: {
        search_text,
        order,
        category_work_type_no,
        work_type_no,
        work_type_detail_no,
        role_weight_no,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
        genre_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 배우검색 탭
  getTabThreeList: loading => {
    var apiName = v1Api;
    var path = '/actor/actor-search-page';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 에러 로그
  logging: ({error, desc}, loading) => {
    var apiName = v1Api;
    var path = '/actor/log';
    var myInit = {
      body: {
        error,
        desc,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  //!------------------------------------------
  //! 인증 없는 api

  // 유저수 가져오기
  getUserCount: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/user-count'; // test_test_test는 무조건 테스트 api로써 반드시 작동한다.
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // FAQ 카테고리 목록
  getFAQCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/faq-types'; // test_test_test는 무조건 테스트 api로써 반드시 작동한다.
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 배우 프로필 등록 기본 정보
  getActorTypeConfig: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/actor-types';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 카테고리 목록
  getPartnerCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/affiliate-categories';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 필터 카테고리 목록
  getAuditionConfigCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/audition-custom-list';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션공고 탭 카테고리 목록
  getAuditionCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/audition-category-list';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 결제 단위 목록
  getPayUnitList: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/pay-unit-list';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 결제 방식 목록
  getPayMethodList: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/pay-method-list';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 이용약관
  getTOS: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/terms-of-service';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 개인정보처리방침
  getPP: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/privacy-policy';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },
};

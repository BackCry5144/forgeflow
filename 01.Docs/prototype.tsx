const { useState, useEffect, useCallback, useRef } = React;

// Lucide Icons
const Search = ({ size = 20, className = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const X = ({ size = 20, className = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);

const FileText = ({ size = 20, className = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
    <path d="M10 9H8"></path>
    <path d="M16 13H8"></path>
    <path d="M16 17H8"></path>
  </svg>
);

const Plus = ({ size = 20, className = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  </svg>
);

const ChevronDown = ({ size = 20, className = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

// Sample Data
const sampleData = [
  {
    id: 'ANM-2023001',
    receptionDate: '2023-10-26',
    receptionGrade: 'Critical',
    occurrenceType: 'Equipment Failure',
    lineCode: 'L001',
    processCode: 'P001',
    equipmentCode: 'EQP001',
    materialCode: 'MAT001',
    anomalyNumber: 'ANM-2023001',
    receiver: '김철수',
    status: '접수완료',
    title: '라인1 설비 고장으로 생산 중단',
    detail: '라인 1의 EQP001 설비에서 비정상적인 소음과 함께 작동이 멈춤. 긴급 점검 필요.',
    damageScope: '생산 라인 전체 중단, 2시간 생산 손실 예상',
    correctiveAction: '긴급 보수팀 투입, 부품 교체 진행 중',
    registrationDate: '2023-10-26 10:30',
    registrant: '박영희',
    registrationGrade: 'Critical',
    receptionTime: '10:00',
    gradeChangeReason: '',
    receptionOpinion: '매우 심각한 상황으로 즉각적인 조치 필요.',
    attachedFile: 'report_ANM-2023001.pdf'
  },
  {
    id: 'ANM-2023002',
    receptionDate: '2023-10-25',
    receptionGrade: 'Major',
    occurrenceType: 'Quality Defect',
    lineCode: 'L002',
    processCode: 'P002',
    equipmentCode: 'EQP005',
    materialCode: 'MAT003',
    anomalyNumber: 'ANM-2023002',
    receiver: '이영희',
    status: '처리중',
    title: '자재 불량으로 인한 제품 품질 저하',
    detail: 'MAT003 자재에서 이물질 발견, 생산된 제품 일부에서 불량 발생.',
    damageScope: '제품 100개 폐기, 재작업 필요',
    correctiveAction: '자재 공급처에 클레임 제기, 불량 자재 전량 회수 및 교체',
    registrationDate: '2023-10-25 14:15',
    registrant: '김민준',
    registrationGrade: 'Major',
    receptionTime: '13:45',
    gradeChangeReason: '',
    receptionOpinion: '자재 입고 시 검수 강화 필요.',
    attachedFile: ''
  },
  {
    id: 'ANM-2023003',
    receptionDate: '2023-10-24',
    receptionGrade: 'Minor',
    occurrenceType: 'Process Error',
    lineCode: 'L003',
    processCode: 'P003',
    equipmentCode: 'EQP010',
    materialCode: 'MAT005',
    anomalyNumber: 'ANM-2023003',
    receiver: '박지훈',
    status: '완료',
    title: '공정 설정 오류로 인한 생산 지연',
    detail: 'P003 공정의 설정값이 잘못 입력되어 생산 속도 저하.',
    damageScope: '생산량 10% 감소, 1시간 지연',
    correctiveAction: '설정값 재확인 및 수정, 작업자 교육 강화',
    registrationDate: '2023-10-24 09:00',
    registrant: '최유리',
    registrationGrade: 'Minor',
    receptionTime: '08:30',
    gradeChangeReason: '',
    receptionOpinion: '정기적인 공정 설정값 점검 필요.',
    attachedFile: ''
  },
  {
    id: 'ANM-2023004',
    receptionDate: '2023-10-23',
    receptionGrade: 'Critical',
    occurrenceType: 'Safety Incident',
    lineCode: 'L001',
    processCode: 'P001',
    equipmentCode: 'EQP002',
    materialCode: 'MAT002',
    anomalyNumber: 'ANM-2023004',
    receiver: '정수진',
    status: '접수완료',
    title: '설비 오작동으로 인한 안전사고 발생',
    detail: 'EQP002 설비의 비상 정지 버튼 오작동으로 작업자 부상 위험 발생.',
    damageScope: '작업자 1명 경미한 부상, 설비 가동 중단',
    correctiveAction: '설비 긴급 점검 및 수리, 안전 교육 재실시',
    registrationDate: '2023-10-23 11:40',
    registrant: '강동원',
    registrationGrade: 'Critical',
    receptionTime: '11:10',
    gradeChangeReason: '',
    receptionOpinion: '안전 관련 설비는 주기적인 점검이 필수.',
    attachedFile: 'safety_report_ANM-2023004.docx'
  },
  {
    id: 'ANM-2023005',
    receptionDate: '2023-10-22',
    receptionGrade: 'Minor',
    occurrenceType: 'Environmental Issue',
    lineCode: 'L004',
    processCode: 'P004',
    equipmentCode: 'EQP015',
    materialCode: 'MAT007',
    anomalyNumber: 'ANM-2023005',
    receiver: '한지민',
    status: '처리중',
    title: '폐수 처리 시설 이상 감지',
    detail: '폐수 처리 시설에서 기준치 이상의 오염물질 배출 감지.',
    damageScope: '환경 규제 위반 가능성, 벌금 부과 위험',
    correctiveAction: '폐수 처리 시설 긴급 점검 및 필터 교체',
    registrationDate: '2023-10-22 16:00',
    registrant: '윤성현',
    registrationGrade: 'Minor',
    receptionTime: '15:30',
    gradeChangeReason: '초기 판단보다 심각하지 않음',
    receptionOpinion: '환경 관련 문제는 신속한 대응이 중요.',
    attachedFile: ''
  },
  {
    id: 'ANM-2023006',
    receptionDate: '2023-10-21',
    receptionGrade: 'Major',
    occurrenceType: 'Software Bug',
    lineCode: 'L005',
    processCode: 'P005',
    equipmentCode: 'EQP020',
    materialCode: 'MAT010',
    anomalyNumber: 'ANM-2023006',
    receiver: '신동엽',
    status: '완료',
    title: '생산 관리 시스템 오류 발생',
    detail: '생산 관리 시스템에서 데이터 동기화 오류로 일부 생산 정보 누락.',
    damageScope: '생산 계획 차질, 데이터 신뢰도 하락',
    correctiveAction: '시스템 긴급 패치 적용, 데이터 복구 작업 완료',
    registrationDate: '2023-10-21 09:45',
    registrant: '이효리',
    registrationGrade: 'Major',
    receptionTime: '09:15',
    gradeChangeReason: '',
    receptionOpinion: '시스템 안정성 강화 필요.',
    attachedFile: 'bug_report_ANM-2023006.log'
  }
];

// UI Components
const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  if (!isOpen) return null;

  const modalRef = useRef(null);

  const handleOverlayClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOverlayClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOverlayClick, handleKeyDown]);

  let modalWidthClass = "max-w-lg"; // md
  if (size === "sm") modalWidthClass = "max-w-sm";
  else if (size === "lg") modalWidthClass = "max-w-2xl";
  else if (size === "xl") modalWidthClass = "max-w-4xl";
  else if (size === "full") modalWidthClass = "w-full h-full";
  else if (size === "custom") modalWidthClass = "max-w-[600px]"; // Specific custom width from prompt

  const isFullScreen = size === "full";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl flex flex-col ${isFullScreen ? 'w-full h-full' : modalWidthClass + ' w-full max-h-[90vh]'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const CodeView = ({ label, value, onClick, placeholder = "검색", required = false, disabled = false }) => (
  <div className="flex flex-col space-y-1.5">
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <input
        type="text"
        value={value || ""}
        readOnly
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors ${
          disabled ? "cursor-not-allowed opacity-50 bg-gray-100" : "cursor-pointer hover:bg-gray-50"
        }`}
      />
      <button
        type="button"
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-blue-600 disabled:opacity-50"
      >
        <Search size={18} />
      </button>
    </div>
  </div>
);

const Input = ({ label, value, onChange, placeholder, required = false, disabled = false, type = "text", className = "" }) => (
  <div className="flex flex-col space-y-1.5">
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        disabled ? "cursor-not-allowed opacity-50 bg-gray-100" : ""
      } ${className}`}
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, required = false, disabled = false, className = "" }) => (
  <div className="flex flex-col space-y-1.5">
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 transition-colors ${
          disabled ? "cursor-not-allowed opacity-50 bg-gray-100" : ""
        } ${className}`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, required = false, disabled = false, className = "" }) => (
  <div className="flex flex-col space-y-1.5">
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <textarea
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows="3"
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        disabled ? "cursor-not-allowed opacity-50 bg-gray-100" : ""
      } ${className}`}
    ></textarea>
  </div>
);

export default function AnomalyManagement() {

// 검색 조건 상태
  const [searchParams, setSearchParams] = useState({
    fromDate: '',
    toDate: '',
    receptionGrade: '',
    occurrenceType: '',
    lineCode: '',
    processCode: '',
    equipmentCode: '',
    materialCode: '',
    anomalyNumber: '',
    receiver: '',
    status: ''
  });

  // 그리드 데이터 상태
  const [gridData, setGridData] = useState([]);

  // 모달 관련 상태
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [isAnomalyDetailModalOpen, setIsAnomalyDetailModalOpen] = useState(false);
  const [currentCodeViewField, setCurrentCodeViewField] = useState(''); // 어떤 CodeView가 열렸는지 식별

  // 이상발생 상세 모달 폼 데이터
  const [anomalyDetailForm, setAnomalyDetailForm] = useState({
    receptionGrade: '',
    receiver: '',
    receptionTime: '',
    gradeChangeReason: '',
    receptionOpinion: '',
    anomalyNumber: '',
    registrant: '',
    status: '',
    registrationTime: '',
    registrationGrade: '',
    occurrenceType: '',
    lineCode: '',
    processCode: '',
    equipmentCode: '',
    materialCode: '',
    title: '',
    detail: '',
    damageScope: '',
    correctiveAction: '',
    attachedFile: ''
  });

  // 콤보박스 옵션
  const gradeOptions = [
    { label: 'Critical', value: 'Critical' },
    { label: 'Major', value: 'Major' },
    { label: 'Minor', value: 'Minor' }
  ];

  const occurrenceTypeOptions = [
    { label: 'Equipment Failure', value: 'Equipment Failure' },
    { label: 'Quality Defect', value: 'Quality Defect' },
    { label: 'Process Error', value: 'Process Error' },
    { label: 'Safety Incident', value: 'Safety Incident' },
    { label: 'Environmental Issue', value: 'Environmental Issue' },
    { label: 'Software Bug', value: 'Software Bug' }
  ];

  const statusOptions = [
    { label: '접수완료', value: '접수완료' },
    { label: '처리중', value: '처리중' },
    { label: '완료', value: '완료' }
  ];

  // 검색 조건 변경 핸들러
  const handleSearchParamChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  }, []);

  // 이상발생 상세 폼 변경 핸들러
  const handleAnomalyDetailFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setAnomalyDetailForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // [조회] 버튼 클릭 핸들러
  const handleSearch = useCallback(() => {
    console.log("Searching with params:", searchParams);
    // 실제 API 호출 대신 샘플 데이터 필터링
    const filteredData = sampleData.filter(item => {
      const itemDate = new Date(item.receptionDate);
      const fromDate = searchParams.fromDate ? new Date(searchParams.fromDate) : null;
      const toDate = searchParams.toDate ? new Date(searchParams.toDate) : null;

      return (
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate) &&
        (!searchParams.receptionGrade || item.receptionGrade === searchParams.receptionGrade) &&
        (!searchParams.occurrenceType || item.occurrenceType === searchParams.occurrenceType) &&
        (!searchParams.lineCode || item.lineCode.includes(searchParams.lineCode)) &&
        (!searchParams.processCode || item.processCode.includes(searchParams.processCode)) &&
        (!searchParams.equipmentCode || item.equipmentCode.includes(searchParams.equipmentCode)) &&
        (!searchParams.materialCode || item.materialCode.includes(searchParams.materialCode)) &&
        (!searchParams.anomalyNumber || item.anomalyNumber.includes(searchParams.anomalyNumber)) &&
        (!searchParams.receiver || item.receiver.includes(searchParams.receiver)) &&
        (!searchParams.status || item.status === searchParams.status)
      );
    });
    setGridData(filteredData);
  }, [searchParams]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    handleSearch(); // 초기 로드 시 전체 데이터 조회
  }, [handleSearch]);

  // [초기화] 버튼 클릭 핸들러
  const handleReset = useCallback(() => {
    setSearchParams({
      fromDate: '',
      toDate: '',
      receptionGrade: '',
      occurrenceType: '',
      lineCode: '',
      processCode: '',
      equipmentCode: '',
      materialCode: '',
      anomalyNumber: '',
      receiver: '',
      status: ''
    });
    // 초기화 후 다시 전체 데이터 조회
    // setSearchParams가 비동기적으로 업데이트되므로, useEffect의 의존성 배열에 searchParams를 추가하여
    // searchParams가 변경된 후 handleSearch가 호출되도록 하거나,
    // 여기서 직접 전체 데이터를 다시 로드하는 로직을 추가할 수 있습니다.
    // 여기서는 handleSearch가 searchParams에 의존하므로, searchParams가 초기화되면 다음 렌더링 시 handleSearch가 호출될 것입니다.
  }, []);

  // CodeView 모달 열기
  const openCodeViewModal = useCallback((field) => {
    setCurrentCodeViewField(field);
    if (field === 'lineCode') setIsLineModalOpen(true);
    else if (field === 'processCode') setIsProcessModalOpen(true);
    else if (field === 'equipmentCode') setIsEquipmentModalOpen(true);
    else if (field === 'materialCode') setIsMaterialModalOpen(true);
    else if (field === 'receiver') setIsReceiverModalOpen(true);
    else if (field === 'anomalyDetail_receiver' || field === 'anomalyDetail_registrant' || field === 'anomalyDetail_lineCode' || field === 'anomalyDetail_processCode' || field === 'anomalyDetail_equipmentCode' || field === 'anomalyDetail_materialCode') {
      // 상세 폼 내 CodeView
      if (field.includes('receiver') || field.includes('registrant')) {
        setIsReceiverModalOpen(true); // 사용자 목록 모달 재활용
      } else if (field.includes('lineCode')) {
        setIsLineModalOpen(true);
      } else if (field.includes('processCode')) {
        setIsProcessModalOpen(true);
      } else if (field.includes('equipmentCode')) {
        setIsEquipmentModalOpen(true);
      } else if (field.includes('materialCode')) {
        setIsMaterialModalOpen(true);
      }
    }
  }, []);

  // CodeView 모달 닫기
  const closeCodeViewModal = useCallback(() => {
    setIsLineModalOpen(false);
    setIsProcessModalOpen(false);
    setIsEquipmentModalOpen(false);
    setIsMaterialModalOpen(false);
    setIsReceiverModalOpen(false);
    setCurrentCodeViewField('');
  }, []);

  // CodeView 선택 값 적용
  const handleCodeSelect = useCallback((code) => {
    if (currentCodeViewField.startsWith('anomalyDetail_')) {
      const fieldName = currentCodeViewField.replace('anomalyDetail_', '');
      setAnomalyDetailForm(prev => ({ ...prev, [fieldName]: code }));
    } else {
      setSearchParams(prev => ({ ...prev, [currentCodeViewField]: code }));
    }
    closeCodeViewModal();
  }, [currentCodeViewField, closeCodeViewModal]);

  // [엑셀] 버튼 클릭 핸들러
  const handleExcelDownload = useCallback(() => {
    console.log("Downloading Excel for current grid data:", gridData);
    alert("엑셀 다운로드 기능은 구현되지 않았습니다.");
    // 실제 구현에서는 gridData를 CSV 또는 XLSX 형식으로 변환하여 다운로드
  }, [gridData]);

  // [접수] 버튼 클릭 핸들러 (이상발생 상세 모달 열기)
  const handleOpenAnomalyDetailModal = useCallback(() => {
    // 새 접수이므로 폼 초기화
    setAnomalyDetailForm({
      receptionGrade: '',
      receiver: '',
      receptionTime: '',
      gradeChangeReason: '',
      receptionOpinion: '',
      anomalyNumber: '',
      registrant: '',
      status: '',
      registrationTime: '',
      registrationGrade: '',
      occurrenceType: '',
      lineCode: '',
      processCode: '',
      equipmentCode: '',
      materialCode: '',
      title: '',
      detail: '',
      damageScope: '',
      correctiveAction: '',
      attachedFile: ''
    });
    setIsAnomalyDetailModalOpen(true);
  }, []);

  // 이상발생 상세 모달 닫기
  const handleCloseAnomalyDetailModal = useCallback(() => {
    setIsAnomalyDetailModalOpen(false);
  }, []);

  // 이상발생 상세 폼 제출 핸들러
  const handleSubmitAnomalyDetail = useCallback(() => {
    console.log("Submitting Anomaly Detail:", anomalyDetailForm);
    // 필수 필드 검증 (예시)
    if (!anomalyDetailForm.receptionGrade || !anomalyDetailForm.receiver) {
      alert("접수 등급과 접수자는 필수 입력 항목입니다.");
      return;
    }
    alert("이상발생 정보가 저장되었습니다.");
    handleCloseAnomalyDetailModal();
    handleSearch(); // 저장 후 그리드 갱신
  }, [anomalyDetailForm, handleCloseAnomalyDetailModal, handleSearch]);

  // CodeView 팝업용 샘플 데이터 (실제로는 API 호출)
  const lineList = [
    { code: 'L001', name: '생산라인 1' },
    { code: 'L002', name: '생산라인 2' },
    { code: 'L003', name: '생산라인 3' },
    { code: 'L004', name: '생산라인 4' },
    { code: 'L005', name: '생산라인 5' }
  ];

  const processList = [
    { code: 'P001', name: '조립 공정' },
    { code: 'P002', name: '검사 공정' },
    { code: 'P003', name: '포장 공정' },
    { code: 'P004', name: '가공 공정' },
    { code: 'P005', name: '도장 공정' }
  ];

  const equipmentList = [
    { code: 'EQP001', name: '로봇팔 A' },
    { code: 'EQP002', name: '컨베이어 벨트' },
    { code: 'EQP005', name: '자동 용접기' },
    { code: 'EQP010', name: 'CNC 머신' },
    { code: 'EQP015', name: '사출 성형기' },
    { code: 'EQP020', name: 'PLC 제어반' }
  ];

  const materialList = [
    { code: 'MAT001', name: '강철 플레이트' },
    { code: 'MAT002', name: '알루미늄 바' },
    { code: 'MAT003', name: '플라스틱 레진' },
    { code: 'MAT005', name: '고무 씰' },
    { code: 'MAT007', name: '구리 와이어' },
    { code: 'MAT010', name: '반도체 칩' }
  ];

  const userList = [
    { id: 'user001', name: '김철수' },
    { id: 'user002', name: '이영희' },
    { id: 'user003', name: '박지훈' },
    { id: 'user004', name: '정수진' },
    { id: 'user005', name: '한지민' },
    { id: 'user006', name: '박영희' },
    { id: 'user007', name: '김민준' },
    { id: 'user008', name: '최유리' },
    { id: 'user009', name: '강동원' },
    { id: 'user010', name: '윤성현' },
    { id: 'user011', name: '신동엽' },
    { id: 'user012', name: '이효리' }
  ];

// 검색 영역 렌더링
  const renderSearchArea = useCallback(() => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Input
          label="일자(From)"
          type="date"
          name="fromDate"
          value={searchParams.fromDate}
          onChange={handleSearchParamChange}
        />
        <Input
          label="일자(To)"
          type="date"
          name="toDate"
          value={searchParams.toDate}
          onChange={handleSearchParamChange}
        />
        <Select
          label="접수 등급"
          name="receptionGrade"
          value={searchParams.receptionGrade}
          onChange={handleSearchParamChange}
          options={[{ label: '전체', value: '' }, ...gradeOptions]}
          placeholder="선택"
        />
        <Select
          label="발생 타입"
          name="occurrenceType"
          value={searchParams.occurrenceType}
          onChange={handleSearchParamChange}
          options={[{ label: '전체', value: '' }, ...occurrenceTypeOptions]}
          placeholder="선택"
        />
        <CodeView
          label="라인 코드"
          value={searchParams.lineCode}
          onClick={() => openCodeViewModal('lineCode')}
          placeholder="라인 코드 검색"
        />
        <CodeView
          label="공정 코드"
          value={searchParams.processCode}
          onClick={() => openCodeViewModal('processCode')}
          placeholder="공정 코드 검색"
        />
        <CodeView
          label="설비 코드"
          value={searchParams.equipmentCode}
          onClick={() => openCodeViewModal('equipmentCode')}
          placeholder="설비 코드 검색"
        />
        <CodeView
          label="자재 코드"
          value={searchParams.materialCode}
          onClick={() => openCodeViewModal('materialCode')}
          placeholder="자재 코드 검색"
        />
        <Input
          label="이상번호"
          name="anomalyNumber"
          value={searchParams.anomalyNumber}
          onChange={handleSearchParamChange}
          placeholder="이상번호 입력"
        />
        <CodeView
          label="접수자"
          value={searchParams.receiver}
          onClick={() => openCodeViewModal('receiver')}
          placeholder="접수자 검색"
        />
        <Select
          label="상태"
          name="status"
          value={searchParams.status}
          onChange={handleSearchParamChange}
          options={[{ label: '전체', value: '' }, ...statusOptions]}
          placeholder="선택"
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 rounded-md bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
        >
          조회
        </button>
      </div>
    </div>
  ), [searchParams, handleSearchParamChange, handleReset, handleSearch, openCodeViewModal]);

  // 그리드 툴바 렌더링
  const renderGridToolbar = useCallback(() => (
    <div className="flex justify-end space-x-2 mb-4">
      <button
        type="button"
        onClick={handleExcelDownload}
        className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center space-x-2"
      >
        <FileText size={18} />
        <span>엑셀</span>
      </button>
      <button
        type="button"
        onClick={handleOpenAnomalyDetailModal}
        className="px-4 py-2 rounded-md bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors flex items-center space-x-2"
      >
        <Plus size={18} />
        <span>접수</span>
      </button>
    </div>
  ), [handleExcelDownload, handleOpenAnomalyDetailModal]);

  // 그리드 영역 렌더링
  const renderGridArea = useCallback(() => (
    <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이상번호</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수일자</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수 등급</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발생 타입</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">라인 코드</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공정 코드</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설비 코드</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자재 코드</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수자</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {gridData.length > 0 ? (
            gridData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.anomalyNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.receptionDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.receptionGrade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.occurrenceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lineCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.processCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.equipmentCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.materialCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.receiver}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.title}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                조회된 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [gridData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">이상발생관리</h1>

      {renderSearchArea()}

      {renderGridToolbar()}

      {renderGridArea()}

{/* 라인 목록 조회 모달 */}
      <Modal
        isOpen={isLineModalOpen}
        onClose={closeCodeViewModal}
        title="라인 목록 조회"
        size="custom"
        footer={
          <button
            type="button"
            onClick={closeCodeViewModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        }
      >
        <div className="flex flex-col space-y-4">
          <Input placeholder="라인 코드 또는 설명 검색" />
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lineList.map((item) => (
                  <tr key={item.code} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCodeSelect(item.code)}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 공정 목록 조회 모달 */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={closeCodeViewModal}
        title="공정 목록 조회"
        size="custom"
        footer={
          <button
            type="button"
            onClick={closeCodeViewModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        }
      >
        <div className="flex flex-col space-y-4">
          <Input placeholder="공정 코드 또는 설명 검색" />
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processList.map((item) => (
                  <tr key={item.code} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCodeSelect(item.code)}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 설비 목록 조회 모달 */}
      <Modal
        isOpen={isEquipmentModalOpen}
        onClose={closeCodeViewModal}
        title="설비 목록 조회"
        size="custom"
        footer={
          <button
            type="button"
            onClick={closeCodeViewModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        }
      >
        <div className="flex flex-col space-y-4">
          <Input placeholder="설비 코드 또는 설명 검색" />
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentList.map((item) => (
                  <tr key={item.code} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCodeSelect(item.code)}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 자재 목록 조회 모달 */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={closeCodeViewModal}
        title="자재 목록 조회"
        size="custom"
        footer={
          <button
            type="button"
            onClick={closeCodeViewModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        }
      >
        <div className="flex flex-col space-y-4">
          <Input placeholder="자재 코드 또는 설명 검색" />
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materialList.map((item) => (
                  <tr key={item.code} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCodeSelect(item.code)}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 사용자 목록 조회 모달 (접수자, 등록자) */}
      <Modal
        isOpen={isReceiverModalOpen}
        onClose={closeCodeViewModal}
        title="사용자 목록 조회"
        size="custom"
        footer={
          <button
            type="button"
            onClick={closeCodeViewModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        }
      >
        <div className="flex flex-col space-y-4">
          <Input placeholder="사용자 ID 또는 이름 검색" />
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCodeSelect(item.name)}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 이상발생 상세 모달 (접수) */}
      <Modal
        isOpen={isAnomalyDetailModalOpen}
        onClose={handleCloseAnomalyDetailModal}
        title="이상발생 상세"
        size="full"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseAnomalyDetailModal}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmitAnomalyDetail}
              className="px-4 py-2 rounded-md bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
            >
              저장
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="접수 등급"
            name="receptionGrade"
            value={anomalyDetailForm.receptionGrade}
            onChange={handleAnomalyDetailFormChange}
            options={gradeOptions}
            placeholder="선택"
            required
          />
          <CodeView
            label="접수자"
            value={anomalyDetailForm.receiver}
            onClick={() => openCodeViewModal('anomalyDetail_receiver')}
            placeholder="접수자 검색"
            required
          />
          <Input
            label="접수 시간"
            type="datetime-local"
            name="receptionTime"
            value={anomalyDetailForm.receptionTime}
            onChange={handleAnomalyDetailFormChange}
          />
          <Input
            label="등급 변경 사유"
            name="gradeChangeReason"
            value={anomalyDetailForm.gradeChangeReason}
            onChange={handleAnomalyDetailFormChange}
            className="lg:col-span-2"
          />
          <Textarea
            label="접수 의견"
            name="receptionOpinion"
            value={anomalyDetailForm.receptionOpinion}
            onChange={handleAnomalyDetailFormChange}
            className="lg:col-span-3"
          />
          <Input
            label="이상번호"
            name="anomalyNumber"
            value={anomalyDetailForm.anomalyNumber}
            onChange={handleAnomalyDetailFormChange}
            disabled // 보통 자동 생성되거나 수정 불가
          />
          <CodeView
            label="등록자"
            value={anomalyDetailForm.registrant}
            onClick={() => openCodeViewModal('anomalyDetail_registrant')}
            placeholder="등록자 검색"
          />
          <Select
            label="상태"
            name="status"
            value={anomalyDetailForm.status}
            onChange={handleAnomalyDetailFormChange}
            options={statusOptions}
            placeholder="선택"
          />
          <Input
            label="등록 시간"
            type="datetime-local"
            name="registrationTime"
            value={anomalyDetailForm.registrationTime}
            onChange={handleAnomalyDetailFormChange}
            disabled // 보통 자동 생성
          />
          <Select
            label="등록 등급"
            name="registrationGrade"
            value={anomalyDetailForm.registrationGrade}
            onChange={handleAnomalyDetailFormChange}
            options={gradeOptions}
            placeholder="선택"
          />
          <Select
            label="발생 타입"
            name="occurrenceType"
            value={anomalyDetailForm.occurrenceType}
            onChange={handleAnomalyDetailFormChange}
            options={occurrenceTypeOptions}
            placeholder="선택"
          />
          <CodeView
            label="라인 코드"
            value={anomalyDetailForm.lineCode}
            onClick={() => openCodeViewModal('anomalyDetail_lineCode')}
            placeholder="라인 코드 검색"
          />
          <CodeView
            label="공정 코드"
            value={anomalyDetailForm.processCode}
            onClick={() => openCodeViewModal('anomalyDetail_processCode')}
            placeholder="공정 코드 검색"
          />
          <CodeView
            label="설비 코드"
            value={anomalyDetailForm.equipmentCode}
            onClick={() => openCodeViewModal('anomalyDetail_equipmentCode')}
            placeholder="설비 코드 검색"
          />
          <CodeView
            label="자재 코드"
            value={anomalyDetailForm.materialCode}
            onClick={() => openCodeViewModal('anomalyDetail_materialCode')}
            placeholder="자재 코드 검색"
          />
          <Input
            label="제목"
            name="title"
            value={anomalyDetailForm.title}
            onChange={handleAnomalyDetailFormChange}
            placeholder="제목 입력"
            className="lg:col-span-3"
          />
          <Textarea
            label="상세 내용"
            name="detail"
            value={anomalyDetailForm.detail}
            onChange={handleAnomalyDetailFormChange}
            placeholder="상세 내용 입력"
            className="lg:col-span-3"
          />
          <Textarea
            label="피해 범위"
            name="damageScope"
            value={anomalyDetailForm.damageScope}
            onChange={handleAnomalyDetailFormChange}
            placeholder="피해 범위 입력"
            className="lg:col-span-3"
          />
          <Textarea
            label="시정 조치"
            name="correctiveAction"
            value={anomalyDetailForm.correctiveAction}
            onChange={handleAnomalyDetailFormChange}
            placeholder="시정 조치 내용 입력"
            className="lg:col-span-3"
          />
          <Input
            label="첨부 파일"
            name="attachedFile"
            value={anomalyDetailForm.attachedFile}
            onChange={handleAnomalyDetailFormChange}
            placeholder="첨부 파일 경로 (예: file.pdf)"
            className="lg:col-span-3"
          />
        </div>
      </Modal>
    </div>
  );
}
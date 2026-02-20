import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useRecommendations } from '../contexts/RecommendationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- Constants ---
const CORE_SUBJECTS = ['Mathematics', 'Kiswahili'];
const LANGUAGE_SUBJECTS = ['English', 'Arabic', 'German', 'French'];

const SUBJECT_CATEGORIES = [
    { label: "Sciences", subjects: ['Chemistry', 'Physics', 'Biology'], icon: "bi-flask" },
    { label: "Applied Sciences", subjects: ['Home Science', 'Agriculture', 'Computer Studies', 'Business Studies'], icon: "bi-laptop" },
    { label: "Humanities", subjects: ['History', 'Geography', 'Religious Education'], icon: "bi-book" },
    { label: "Creative Arts", subjects: ['Music', 'Art and Design'], icon: "bi-palette" },
    { label: "Technical Subjects", subjects: ['Drawing and Design', 'Building Construction', 'Power and Mechanics', 'Metalwork', 'Aviation', 'Woodwork', 'Electronics'], fullWidth: true, icon: "bi-tools" }
];

const ALL_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

const StudentForm = () => {
  const [step, setStep] = useState(1);
  const [grades, setGrades] = useState<{ [subject: string]: string }>({});
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedLanguageGrade, setSelectedLanguageGrade] = useState('');
  const [interests, setInterests] = useState('Music');
  const [skills, setSkills] = useState('Communication');
  
  // Aptitudes
  const [linguistic, setLinguistic] = useState<number | ''>('');
  const [musical, setMusical] = useState<number | ''>('');
  const [bodily, setBodily] = useState<number | ''>('');
  const [logicalMathematical, setLogicalMathematical] = useState<number | ''>('');
  const [spatialVisualization, setSpatialVisualization] = useState<number | ''>('');
  const [interpersonal, setInterpersonal] = useState<number | ''>('');
  const [intrapersonal, setIntrapersonal] = useState<number | ''>('');
  const [naturalist, setNaturalist] = useState<number | ''>('');
  
  const [performanceIndicators, setPerformanceIndicators] = useState<{ [key: string]: 'POOR' | 'AVG' | 'BEST' }>({
    p1: 'AVG', p2: 'AVG', p3: 'AVG', p4: 'AVG', p5: 'AVG', p6: 'AVG', p7: 'AVG', p8: 'AVG'
  });
  
  const [error, setError] = useState<string | null>(null);
  const { setRecommendations, setIsLoading, isLoading } = useRecommendations();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleGradeChange = (subject: string, grade: string) => {
    setGrades(prev => ({ ...prev, [subject]: grade }));
  };

  const getFilteredGrades = () => {
    const gradesWithLanguage = { ...grades };
    const finalSelectedLanguage = selectedLanguage || 'English';
    if (finalSelectedLanguage && selectedLanguageGrade) {
        gradesWithLanguage[finalSelectedLanguage] = selectedLanguageGrade;
    }
    return Object.entries(gradesWithLanguage)
        .filter(([, grade]) => grade !== '')
        .reduce<{ [key: string]: string }>((acc, [subject, grade]) => ({ ...acc, [subject]: grade }), {});
  };

  const validateStep = (currentStep: number) => {
    setError(null);
    const gradesObject = getFilteredGrades();

    if (currentStep === 1) {
      if (Object.keys(gradesObject).length !== 7) {
        setError('Please select exactly 7 subjects.');
        return false;
      }
      for (const subject of CORE_SUBJECTS) {
        if (!gradesObject[subject]) {
          setError(`Please select a grade for ${subject}.`);
          return false;
        }
      }
      if (!selectedLanguage || !selectedLanguageGrade) {
        setError('Please select one language and its grade.');
        return false;
      }
      const scienceSubjects = SUBJECT_CATEGORIES.find(cat => cat.label === "Sciences")?.subjects || [];
      const selectedScienceCount = Object.keys(gradesObject).filter(subject => scienceSubjects.includes(subject)).length;
      if (selectedScienceCount < 2) {
        setError('Please select at least 2 Science subjects.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateStep(step)) return;

    setIsLoading(true);
    const gradesObject = getFilteredGrades();

    const studentData = {
      grades: gradesObject,
      interests: interests.split(',').map(s => s.trim()).filter(s => s),
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      linguistic: linguistic || 0,
      musical: musical || 0,
      bodily: bodily || 0,
      logicalMathematical: logicalMathematical || 0,
      spatialVisualization: spatialVisualization || 0,
      interpersonal: interpersonal || 0,
      intrapersonal: intrapersonal || 0,
      naturalist: naturalist || 0,
      ...performanceIndicators
    };

    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setRecommendations(data);
      navigate('/report');
    } catch (err) {
      setError('Failed to get recommendations. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSubjectRow = (subject: string) => (
    <div key={subject} className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3 hover-bg-light transition">
      <Form.Label className="mb-0 fw-medium">{subject}</Form.Label>
      <Form.Select 
        style={{ width: '140px' }}
        className="rounded-pill shadow-sm"
        value={grades[subject] || ''} 
        onChange={(e) => handleGradeChange(subject, e.target.value)}
      >
        <option value="">Grade</option>
        {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
      </Form.Select>
    </div>
  );

  return (
    <div className="container-fluid no-print">
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-5">
        <div className="bg-primary p-4 text-white text-center">
          <h2 className="fw-bold mb-0">Career Path Assessment</h2>
          <p className="opacity-75 mb-0">Step {step} of 3: {step === 1 ? 'Academic Performance' : step === 2 ? 'Aptitudes & Skills' : 'Personal Assessment'}</p>
        </div>
        <ProgressBar now={(step / 3) * 100} className="rounded-0" style={{ height: '6px' }} />
        
        <Card.Body className="p-4 p-lg-5">
          {error && <Alert variant="danger" className="rounded-3 shadow-sm border-0 d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </Alert>}

          <Form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="alert alert-light border-0 shadow-sm mb-4">
                  <h6 className="fw-bold text-primary"><i className="bi bi-info-circle me-2"></i> Requirements</h6>
                  <small className="text-muted d-block">Please select exactly <strong>7 subjects</strong>. Mathematics, Kiswahili, and at least one Language and two Sciences are compulsory.</small>
                </div>

                <Row className="g-4">
                  <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 bg-light">
                      <Card.Body>
                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                          <i className="bi bi-star-fill text-warning me-2"></i> Core & Languages
                        </h5>
                        {CORE_SUBJECTS.map(renderSubjectRow)}
                        <hr className="my-4 opacity-10" />
                        <div className="d-flex flex-column gap-3">
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase">Best Language</Form.Label>
                            <Form.Select className="rounded-pill shadow-sm" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                              {LANGUAGE_SUBJECTS.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase">Grade</Form.Label>
                            <Form.Select className="rounded-pill shadow-sm" value={selectedLanguageGrade} onChange={(e) => setSelectedLanguageGrade(e.target.value)}>
                              <option value="">Select Grade</option>
                              {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {SUBJECT_CATEGORIES.map(category => (
                    <Col key={category.label} lg={category.fullWidth ? 12 : 6}>
                      <Card className="h-100 border-0 shadow-sm rounded-4">
                        <Card.Body>
                          <h5 className="fw-bold mb-4 d-flex align-items-center">
                            <i className={`bi ${category.icon} text-primary me-2`}></i> {category.label}
                          </h5>
                          {category.fullWidth ? (
                            <Row className="g-3">
                              {category.subjects.map(s => <Col md={6} key={s}>{renderSubjectRow(s)}</Col>)}
                            </Row>
                          ) : category.subjects.map(renderSubjectRow)}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <Row className="g-4">
                  <Col lg={7}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                      <Card.Body>
                        <h5 className="fw-bold mb-4"><i className="bi bi-graph-up-arrow text-primary me-2"></i> Aptitude Scores (1-20)</h5>
                        <p className="text-muted small mb-4">Rate your natural ability in these areas based on previous assessments or self-reflection.</p>
                        
                        <Row className="g-3">
                          {[
                            { label: 'Linguistic', val: linguistic, set: setLinguistic },
                            { label: 'Musical', val: musical, set: setMusical },
                            { label: 'Bodily-Kinesthetic', val: bodily, set: setBodily },
                            { label: 'Logical-Mathematical', val: logicalMathematical, set: setLogicalMathematical },
                            { label: 'Spatial-Visualization', val: spatialVisualization, set: setSpatialVisualization },
                            { label: 'Interpersonal', val: interpersonal, set: setInterpersonal },
                            { label: 'Intrapersonal', val: intrapersonal, set: setIntrapersonal },
                            { label: 'Naturalist', val: naturalist, set: setNaturalist }
                          ].map(apt => (
                            <Col md={6} key={apt.label}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">{apt.label}</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Form.Range 
                                    min="1" max="20" step="1" 
                                    value={apt.val || 1} 
                                    onChange={(e) => apt.set(parseInt(e.target.value))} 
                                  />
                                  <Badge bg="primary" pill className="p-2" style={{ width: '35px' }}>{apt.val || '-'}</Badge>
                                </div>
                              </Form.Group>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={5}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-light">
                      <Card.Body>
                        <h5 className="fw-bold mb-4"><i className="bi bi-person-check text-primary me-2"></i> Interests & Skills</h5>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold">Your Interests</Form.Label>
                          <Form.Control 
                            as="textarea" rows={3}
                            className="rounded-4 border-0 shadow-sm p-3"
                            placeholder="e.g., Programming, Music, Writing, Sports..." 
                            value={interests} 
                            onChange={(e) => setInterests(e.target.value)} 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">Your Skills</Form.Label>
                          <Form.Control 
                            as="textarea" rows={3}
                            className="rounded-4 border-0 shadow-sm p-3"
                            placeholder="e.g., Problem Solving, Leadership, Coding..." 
                            value={skills} 
                            onChange={(e) => setSkills(e.target.value)} 
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in text-center">
                <Card className="border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: '800px' }}>
                  <Card.Body className="p-lg-5">
                    <h5 className="fw-bold mb-4"><i className="bi bi-clipboard-check text-primary me-2"></i> Final Performance Indicators</h5>
                    <p className="text-muted mb-5">Please rate your consistent performance across these indicators (P1-P8).</p>
                    
                    <Row className="g-3">
                      {Object.keys(performanceIndicators).map((pKey) => (
                        <Col md={6} key={pKey}>
                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                            <span className="fw-bold text-primary">{pKey.toUpperCase()}</span>
                            <div className="btn-group shadow-sm rounded-pill overflow-hidden" role="group">
                              {['POOR', 'AVG', 'BEST'].map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  className={`btn btn-sm px-3 ${performanceIndicators[pKey] === level ? 'btn-primary' : 'btn-white'}`}
                                  onClick={() => setPerformanceIndicators(prev => ({ ...prev, [pKey]: level as 'POOR' | 'AVG' | 'BEST' }))}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <div className="mt-5 p-4 bg-primary bg-opacity-10 rounded-4">
                      <p className="small mb-0 text-primary">
                        <i className="bi bi-shield-check me-2"></i>
                        By clicking "Generate Recommendations", our AI will process your data to find the best career matches.
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
              {step > 1 && (
                <Button variant="outline-secondary" size="lg" className="rounded-pill px-5" onClick={prevStep} disabled={isLoading}>
                  <i className="bi bi-arrow-left me-2"></i> Back
                </Button>
              )}
              {step < 3 ? (
                <Button variant="primary" size="lg" className="rounded-pill px-5 ms-auto shadow" onClick={nextStep}>
                  Continue <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              ) : (
                <Button variant="success" size="lg" type="submit" className="rounded-pill px-5 ms-auto shadow" disabled={isLoading}>
                  {isLoading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span> Analyzing...</>
                  ) : (
                    <><i className="bi bi-magic me-2"></i> Generate Recommendations</>
                  )}
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .transition { transition: all 0.2s ease-in-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-white { background: white; border: 1px solid #dee2e6; color: #6c757d; }
        .btn-white:hover { background: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default StudentForm;

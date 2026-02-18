import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useRecommendations } from '../contexts/RecommendationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// --- Constants ---
const CORE_SUBJECTS = ['Mathematics', 'Kiswahili'];
const LANGUAGE_SUBJECTS = ['English', 'Arabic', 'German', 'French'];

const SUBJECT_CATEGORIES = [
    { label: "Sciences", subjects: ['Chemistry', 'Physics', 'Biology'] },
    { label: "Applied sciences", subjects: ['Home Science', 'Agriculture', 'Computer Studies', 'Business Studies'] },
    { label: "Humanities", subjects: ['History', 'Geography', 'Religious Education'] },
    { label: "Creative arts", subjects: ['Music', 'Art and Design'] },
    { label: "Technical subjects", subjects: ['Drawing and Design', 'Building Construction', 'Power and Mechanics', 'Metalwork', 'Aviation', 'Woodwork', 'Electronics'], fullWidth: true }
];

const ALL_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];


// --- Main Component ---
const StudentForm = () => {
  const [grades, setGrades] = useState<{ [subject: string]: string }>({});
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedLanguageGrade, setSelectedLanguageGrade] = useState('');
  const [interests, setInterests] = useState('Music'); // Reverted to string for comma-separated
  const [skills, setSkills] = useState('Communication');
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
  const { token } = useAuth(); // Get token from AuthContext
  const navigate = useNavigate();

  const handleGradeChange = (subject: string, grade: string) => {
    setGrades(prevGrades => ({
        ...prevGrades,
        [subject]: grade
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setRecommendations(null);

    // Create a mutable copy of grades
    const gradesWithLanguage = { ...grades };
    // Ensure English is the default if no other language is selected
    const finalSelectedLanguage = selectedLanguage || 'English';
    if (finalSelectedLanguage && selectedLanguageGrade) {
        gradesWithLanguage[finalSelectedLanguage] = selectedLanguageGrade;
    }

    // Filter out subjects where a grade has not been selected
    const gradesObject = Object.entries(gradesWithLanguage)
        .filter(([, grade]) => grade !== '')
        .reduce<{ [key: string]: string }>((acc, [subject, grade]) => ({ ...acc, [subject]: grade }), {});

    // --- New Validation Logic ---

    // 1. Total number of subjects must be exactly 7
    if (Object.keys(gradesObject).length !== 7) {
        setError('Please select exactly 7 subjects. These should be your 7 best-performed subjects.');
        setIsLoading(false);
        return;
    }

    // 2. Core subjects are compulsory
    for (const subject of CORE_SUBJECTS) {
      if (!gradesObject[subject]) {
        setError(`Please select a grade for the core subject: ${subject}.`);
        setIsLoading(false);
        return;
      }
    }

    // 3. One language is compulsory
    if (!selectedLanguage || !selectedLanguageGrade) {
        setError('Please select one language and a grade for it.');
        setIsLoading(false);
        return;
    }

    // 4. At least 2 science subjects are compulsory
    const scienceSubjects = SUBJECT_CATEGORIES.find(cat => cat.label === "Sciences")?.subjects || [];
    const selectedScienceCount = Object.keys(gradesObject).filter(subject => scienceSubjects.includes(subject)).length;
    if (selectedScienceCount < 2) {
        setError('Please select a grade for at least 2 subjects from the Sciences category.');
        setIsLoading(false);
        return;
    }
    
    // --- End of New Validation Logic ---

    const studentData = {
      grades: gradesObject,
      interests: interests.split(',').map(s => s.trim()).filter(s => s),
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      linguistic: linguistic || 0, // Default to 0 if not provided
      musical: musical || 0,
      bodily: bodily || 0,
      logicalMathematical: logicalMathematical || 0,
      spatialVisualization: spatialVisualization || 0,
      interpersonal: interpersonal || 0,
      intrapersonal: intrapersonal || 0,
      naturalist: naturalist || 0,
      p1: performanceIndicators.p1,
      p2: performanceIndicators.p2,
      p3: performanceIndicators.p3,
      p4: performanceIndicators.p4,
      p5: performanceIndicators.p5,
      p6: performanceIndicators.p6,
      p7: performanceIndicators.p7,
      p8: performanceIndicators.p8,
    };

    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add Authorization header
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setRecommendations(data);
      navigate('/report');
    } catch (err) {
      setError('Failed to get recommendations. Please ensure the backend is running and reachable.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSubjectRow = (subject: string) => (
    <Row key={subject} className="mb-2 align-items-center">
        <Col md={6}><Form.Label>{subject}</Form.Label></Col>
        <Col md={4}>
            <Form.Select value={grades[subject] || ''} onChange={(e) => handleGradeChange(subject, e.target.value)}>
                <option value="">Select Grade</option>
                {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </Form.Select>
        </Col>
    </Row>
  );

  return (
    <>
      <div className="no-print">
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Enter Your Details</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                
                <Row>
                    <Col md={6} lg={4} className="mb-3">
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title as="h6" className="fw-bold text-center">Core Subjects</Card.Title>
                                {CORE_SUBJECTS.map(renderSubjectRow)}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={4} className="mb-3">
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title as="h6" className="fw-bold text-center">Languages</Card.Title>
                                <Form.Text className="d-block text-center mb-2">Select your single best-performed language.</Form.Text>
                                <Row className="mb-2 align-items-center">
                                    <Col md={6}>
                                        <Form.Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                                            <option value="">Select Language</option>
                                            {LANGUAGE_SUBJECTS.map(lang => (
                                                <option key={lang} value={lang}>{lang}</option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Select value={selectedLanguageGrade} onChange={(e) => setSelectedLanguageGrade(e.target.value)}>
                                            <option value="">Select Grade</option>
                                            {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                    {SUBJECT_CATEGORIES.map(category => (
                        <Col key={category.label} md={category.fullWidth ? 12 : 6} lg={category.fullWidth ? 12 : 4} className="mb-3">
                            <Card className="h-100">
                                <Card.Body>
                                    <Card.Title as="h6" className="fw-bold text-center">{category.label}</Card.Title>
                                    {category.subjects.map(renderSubjectRow)}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

              <Form.Group className="mb-3">
                <Form.Label>Your Interests (comma-separated)</Form.Label>
                <Form.Control type="text" placeholder="e.g., Programming, Reading, Sports" value={interests} onChange={(e) => setInterests(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Your Skills (comma-separated)</Form.Label>
                <Form.Control type="text" placeholder="e.g., Communication, Problem Solving" value={skills} onChange={(e) => setSkills(e.target.value)} />
              </Form.Group>

              {/* New Aptitude Scores Section */}
              <Col md={12} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title as="h6" className="fw-bold text-center">Aptitude Scores (1-20)</Card.Title>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Linguistic</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={linguistic} onChange={(e) => setLinguistic(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Musical</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={musical} onChange={(e) => setMusical(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Bodily</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={bodily} onChange={(e) => setBodily(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Logical - Mathematical</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={logicalMathematical} onChange={(e) => setLogicalMathematical(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Spatial-Visualization</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={spatialVisualization} onChange={(e) => setSpatialVisualization(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Interpersonal</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={interpersonal} onChange={(e) => setInterpersonal(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Intrapersonal</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={intrapersonal} onChange={(e) => setIntrapersonal(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                    <Row className="mb-2 align-items-center">
                      <Col md={6}><Form.Label>Naturalist</Form.Label></Col>
                      <Col md={4}>
                        <Form.Control type="number" min="1" max="20" value={naturalist} onChange={(e) => setNaturalist(parseInt(e.target.value) || '')} />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* New P1-P8 Section */}
              <Col md={12} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title as="h6" className="fw-bold text-center">Performance Indicators (P1-P8)</Card.Title>
                    {/* Render P1-P8 inputs */}
                    {Object.keys(performanceIndicators).map((pKey, index) => (
                      <Row key={pKey} className="mb-2 align-items-center">
                        <Col md={6}><Form.Label>{pKey.toUpperCase()}</Form.Label></Col>
                        <Col md={4}>
                          <Form.Select
                            value={performanceIndicators[pKey]}
                            onChange={(e) => setPerformanceIndicators(prev => ({ ...prev, [pKey]: e.target.value as 'POOR' | 'AVG' | 'BEST' }))}
                          >
                            <option value="AVG">AVG</option>
                            <option value="POOR">POOR</option>
                            <option value="BEST">BEST</option>
                          </Form.Select>
                        </Col>
                      </Row>
                    ))}
                  </Card.Body>
                </Card>
              </Col>

              <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? 'Analyzing...' : 'Get Recommendations'}</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default StudentForm;

import React, { useState } from 'react';
import './App.css';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('exam');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getColorForScore = (score: number) => {
    if (score >= 90) return '#28a745'; // Green
    if (score >= 75) return '#17a2b8'; // Blue
    if (score >= 50) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getTextForScore = (score: number) => {
    if (score >= 90) return 'ممتاز';
    if (score >= 75) return 'جيد';
    if (score >= 50) return 'مقبول';
    return 'يحتاج تحسين';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('data_type', dataType);

    try {
      const response = await fetch('http://localhost:10000/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError(
        'Failed to connect to the server. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App bg-light min-vh-100 py-5">
      <Container>
        <Row className="mb-5">
          <Col>
            <h1 className="text-center display-4 fw-bold text-primary">
              Grade Analyzer
            </h1>
            <p className="text-center text-muted lead">
              Upload your grade data and get detailed analysis
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={8} className="mx-auto">
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Select Data Type
                    </Form.Label>
                    <Form.Select
                      value={dataType}
                      onChange={(e) => setDataType(e.target.value)}
                      className="form-select-lg"
                    >
                      <option value="exam">Exam Data</option>
                      <option value="homework">Homework Data</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Upload CSV File</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="form-control-lg"
                    />
                    <Form.Text className="text-muted">
                      Make sure your CSV file has the required columns in Arabic
                    </Form.Text>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Grades'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {analysisResult && (
              <Card className="mt-4 shadow-lg border-0">
                <Card.Body className="p-4">
                  <h3 className="text-center mb-4">Analysis Results</h3>

                  {/* Overall Score Circle */}
                  <div className="text-center mb-5">
                    <div style={{ width: '200px', margin: '0 auto' }}>
                      <CircularProgressbar
                        value={analysisResult.average_result}
                        text={`${analysisResult.average_result}%`}
                        styles={buildStyles({
                          pathColor: getColorForScore(
                            analysisResult.average_result
                          ),
                          textColor: getColorForScore(
                            analysisResult.average_result
                          ),
                          trailColor: '#eee',
                        })}
                      />
                    </div>
                    <div className="mt-3">
                      <h4
                        style={{
                          color: getColorForScore(
                            analysisResult.average_result
                          ),
                        }}
                      >
                        {getTextForScore(analysisResult.average_result)}
                      </h4>
                      <p className="text-success h5 mt-2">
                        {analysisResult.motivation_message}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Results Table */}
                  <div className="table-responsive mt-4">
                    <table className="table table-hover">
                      <thead className="bg-light">
                        <tr>
                          {Object.keys(analysisResult.data[0]).map((key) => (
                            <th key={key} className="text-center">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.data.map((row: any, index: number) => {
                          const score = parseFloat(
                            row['النتيجة'].replace('%', '')
                          );
                          const isLowScore = score < 75;

                          return (
                            <tr
                              key={index}
                              className={isLowScore ? 'table-warning' : ''}
                              style={{
                                backgroundColor: isLowScore
                                  ? 'rgba(255, 193, 7, 0.1)'
                                  : 'inherit',
                              }}
                            >
                              {Object.entries(row).map(
                                ([key, value]: [string, any], i: number) => (
                                  <td
                                    key={i}
                                    className="text-center"
                                    style={{
                                      color:
                                        key === 'النتيجة'
                                          ? getColorForScore(parseFloat(value))
                                          : 'inherit',
                                      fontWeight:
                                        key === 'النتيجة' ? 'bold' : 'normal',
                                    }}
                                  >
                                    {value}
                                  </td>
                                )
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;

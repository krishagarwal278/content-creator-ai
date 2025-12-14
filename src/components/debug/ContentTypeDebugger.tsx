/**
 * Debug Helper - Test Content Type Values
 * 
 * This component helps you test which content_type values are accepted by your database.
 * Use this to find the correct values for the check constraint.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateProject } from '@/hooks/useProjects';

export function ContentTypeDebugger() {
    const [testValue, setTestValue] = useState('');
    const [results, setResults] = useState<Array<{ value: string; success: boolean; error?: string }>>([]);
    const createProject = useCreateProject();

    const testContentType = async (value: string) => {
        try {
            await createProject.mutateAsync({
                name: `Test ${value}`,
                content_type: value as any,
                description: 'Debug test',
                target_duration: 60,
                model: 'standard',
                voiceover_enabled: false,
                captions_enabled: false,
            });

            setResults(prev => [...prev, { value, success: true }]);
            return true;
        } catch (error: any) {
            setResults(prev => [...prev, {
                value,
                success: false,
                error: error.message
            }]);
            return false;
        }
    };

    const testCommonValues = async () => {
        const valuesToTest = [
            'short',
            'Short',
            'SHORT',
            'reel',
            'Reel',
            'REEL',
            'video',
            'Video',
            'VIDEO',
            'presentation',
            'Presentation',
            'PRESENTATION',
        ];

        setResults([]);

        for (const value of valuesToTest) {
            await testContentType(value);
            // Wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    return (
        <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Content Type Debugger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Test a specific value:</h3>
                    <div className="flex gap-2">
                        <Input
                            value={testValue}
                            onChange={(e) => setTestValue(e.target.value)}
                            placeholder="Enter content_type value to test"
                        />
                        <Button onClick={() => testContentType(testValue)}>
                            Test
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Or test common values:</h3>
                    <Button onClick={testCommonValues} variant="outline">
                        Test All Common Values
                    </Button>
                </div>

                {results.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Results:</h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {results.map((result, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded text-sm ${result.success
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'bg-red-500/10 text-red-500'
                                        }`}
                                >
                                    <span className="font-mono">{result.value}</span>
                                    {' - '}
                                    {result.success ? '✅ SUCCESS' : `❌ ${result.error}`}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    <p>This will create test projects in your database.</p>
                    <p>Delete them after finding the correct values.</p>
                </div>
            </CardContent>
        </Card>
    );
}

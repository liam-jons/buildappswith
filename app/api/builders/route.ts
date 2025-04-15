import { NextRequest, NextResponse } from 'next/server';
import { builderProfileSchema } from '@/lib/validations/builder-profile';
import { ValidationTier } from '@/types/builder';

// Mock database for development - will be replaced with real database later
let builders: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    
    const validationTier = queryParams.get('validationTier') as ValidationTier | null;
    const specialization = queryParams.get('specialization');
    const skill = queryParams.get('skill');
    
    // Apply filters
    let filteredBuilders = [...builders];
    
    if (validationTier) {
      filteredBuilders = filteredBuilders.filter(builder => 
        builder.validationTier === validationTier
      );
    }
    
    if (specialization) {
      filteredBuilders = filteredBuilders.filter(builder => 
        builder.specializationTags.includes(specialization)
      );
    }
    
    if (skill) {
      filteredBuilders = filteredBuilders.filter(builder => 
        builder.skills.includes(skill)
      );
    }
    
    return NextResponse.json(filteredBuilders, { status: 200 });
  } catch (error) {
    console.error('Error fetching builders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validation
    const validatedData = builderProfileSchema.parse(body);
    
    // In a real implementation, we would:
    // 1. Check if the user is authenticated
    // 2. Create the profile in the database
    // 3. Set default validationTier to ENTRY
    // 4. Generate unique ID and timestamps
    
    const newBuilder = {
      id: `builder_${Date.now()}`,
      userId: 'mock_user_id', // Would come from auth in real implementation
      validationTier: ValidationTier.ENTRY,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock database
    builders.push(newBuilder);
    
    return NextResponse.json(newBuilder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating builder profile:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create builder profile' },
      { status: 500 }
    );
  }
}

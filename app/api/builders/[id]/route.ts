import { NextRequest, NextResponse } from 'next/server';
import { builderProfileUpdateSchema } from '@/lib/validations/builder-profile';

// Mock database for development - will be replaced with real database later
// This should be in a shared file in production
let builders: any[] = [];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find builder in mock database
    const builder = builders.find(b => b.id === id);
    
    if (!builder) {
      return NextResponse.json(
        { error: 'Builder profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(builder, { status: 200 });
  } catch (error) {
    console.error('Error fetching builder profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    
    // Find builder in mock database
    const builderIndex = builders.findIndex(b => b.id === id);
    
    if (builderIndex === -1) {
      return NextResponse.json(
        { error: 'Builder profile not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Check if the user is authenticated and authorized
    // 2. Validate the update data
    // 3. Update the profile in the database
    
    // Validation
    const validatedData = builderProfileUpdateSchema.parse(body);
    
    // Update builder in mock database
    const updatedBuilder = {
      ...builders[builderIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    builders[builderIndex] = updatedBuilder;
    
    return NextResponse.json(updatedBuilder, { status: 200 });
  } catch (error: any) {
    console.error('Error updating builder profile:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update builder profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find builder in mock database
    const builderIndex = builders.findIndex(b => b.id === id);
    
    if (builderIndex === -1) {
      return NextResponse.json(
        { error: 'Builder profile not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Check if the user is authenticated and authorized
    // 2. Delete the profile from the database or mark as inactive
    
    // Remove builder from mock database
    builders.splice(builderIndex, 1);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting builder profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete builder profile' },
      { status: 500 }
    );
  }
}

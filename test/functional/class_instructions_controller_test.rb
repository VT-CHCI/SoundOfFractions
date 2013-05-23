require 'test_helper'

class ClassInstructionsControllerTest < ActionController::TestCase
  setup do
    @class_instruction = class_instructions(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:class_instructions)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create class_instruction" do
    assert_difference('ClassInstruction.count') do
      post :create, class_instruction: @class_instruction.attributes
    end

    assert_redirected_to class_instruction_path(assigns(:class_instruction))
  end

  test "should show class_instruction" do
    get :show, id: @class_instruction
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @class_instruction
    assert_response :success
  end

  test "should update class_instruction" do
    put :update, id: @class_instruction, class_instruction: @class_instruction.attributes
    assert_redirected_to class_instruction_path(assigns(:class_instruction))
  end

  test "should destroy class_instruction" do
    assert_difference('ClassInstruction.count', -1) do
      delete :destroy, id: @class_instruction
    end

    assert_redirected_to class_instructions_path
  end
end

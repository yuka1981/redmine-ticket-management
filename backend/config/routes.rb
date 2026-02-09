Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :tickets, only: [ :index, :show, :create, :update, :destroy ]
    resources :statuses, only: [ :index ]
    resources :priorities, only: [ :index ]
    resources :trackers, only: [ :index ]
    resources :projects, only: [ :index ]
    get "dashboard", to: "dashboard#show"
    post "auth/verify", to: "auth#verify"
  end
end
